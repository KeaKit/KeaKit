#!/bin/bash
set -e

# Configuración
GH_TOKEN="${GH_TOKEN}"
PROJECT_ID="PVT_kwDOD3Si084BPCwq"
REPO_OWNER="KeaKit"
REPO_NAME="KeaKit"
MILESTONE_NUMBER=${1:-3}  # Si no se pasa argumento, usa 3

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🔍 Script para MILESTONE #$MILESTONE_NUMBER${NC}"
echo -e "${PURPLE}========================================${NC}"

# Crea un script Python temporal (era mejor así)
PYTHON_SCRIPT=$(mktemp)
cat > "$PYTHON_SCRIPT" << 'EOF'
import requests
import datetime
import sys
import os

# Configuración desde variables de entorno
GH_TOKEN = os.environ.get('GH_TOKEN')
PROJECT_ID = os.environ.get('PROJECT_ID')
REPO_OWNER = os.environ.get('REPO_OWNER')
REPO_NAME = os.environ.get('REPO_NAME')
MILESTONE_NUMBER = int(os.environ.get('MILESTONE_NUMBER', '2'))

headers = {
    "Authorization": f"Bearer {GH_TOKEN}",
    "Content-Type": "application/json"
}

def graphql(query, variables=None):
    """Función auxiliar para ejecutar consultas GraphQL"""
    r = requests.post(
        "https://api.github.com/graphql",
        json={"query": query, "variables": variables or {}},
        headers=headers
    )
    data = r.json()
    if "errors" in data:
        print("Error en la consulta GraphQL:")
        for error in data["errors"]:
            print(f"  - {error.get('message', 'Error desconocido')}")
        return None
    return data

def obtener_issues_milestone(milestone_number):
    """Obtiene todos los issues de un milestone concreto"""
    print(f"Obteniendo issues del milestone #{milestone_number}...")
    
    issues = []
    page = 1
    
    while True:
        url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"
        params = {
            "milestone": str(milestone_number),
            "state": "all",
            "per_page": 100,
            "page": page
        }
        
        response = requests.get(url, params=params, headers=headers)
        
        if response.status_code != 200:
            print(f"Error obteniendo issues: {response.status_code}")
            break
            
        page_issues = response.json()
        if not page_issues:
            break
            
        issues.extend(page_issues)
        print(f"  Obtenidos {len(issues)} issues hasta ahora...")
        page += 1
    
    print(f"Total issues en milestone #{milestone_number}: {len(issues)}")
    return issues

def obtener_items_project_filtrados(milestone_number):
    """Obtiene los items del proyecto que pertenecen al milestone especificado"""
    
    milestone_issues = obtener_issues_milestone(milestone_number)
    milestone_numbers = {issue["number"] for issue in milestone_issues}
    print(f"Números de issue en milestone: {sorted(milestone_numbers)}")
    
    items_filtrados = []
    cursor = None
    has_next = True

    print("\nObteniendo issues del proyecto y filtrando...")
    
    query = """
    query($project: ID!, $cursor: String) {
      node(id: $project) {
        ... on ProjectV2 {
          items(first: 100, after: $cursor) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                  title
                  milestone {
                    number
                    title
                  }
                }
                ... on DraftIssue {
                  title
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
    """

    while has_next:
        response = graphql(query, {"project": PROJECT_ID, "cursor": cursor})
        if not response:
            break
            
        node = response.get("data", {}).get("node")
        if not node:
            break

        page = node["items"]
        
        for item in page["nodes"]:
            content = item.get("content", {})
            
            if "title" in content and "number" not in content:
                print(f" Incluyendo draft: {content['title'][:30]}...")
                items_filtrados.append(item)
                continue
            
            issue_number = content.get("number")
            if issue_number and issue_number in milestone_numbers:
                milestone_info = content.get("milestone", {})
                milestone_title = milestone_info.get("title", "Desconocido")
                print(f" Incluyendo issue #{issue_number} - Milestone: {milestone_title}")
                items_filtrados.append(item)

        has_next = page["pageInfo"]["hasNextPage"]
        cursor = page["pageInfo"]["endCursor"]
        
        print(f"  Obtenidos {len(items_filtrados)} items del milestone hasta ahora...")

    print(f"Total items del milestone encontrados en proyecto: {len(items_filtrados)}")
    return items_filtrados

def obtener_campos_proyecto():
    """Obtiene todos los campos personalizados del proyecto"""
    query = """
    query($project: ID!) {
      node(id: $project) {
        ... on ProjectV2 {
          fields(first: 50) {
            nodes {
              __typename
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
              ... on ProjectV2IterationField {
                id
                name
              }
            }
          }
        }
      }
    }
    """

    response = graphql(query, {"project": PROJECT_ID})
    if not response:
        return {}
        
    campos = {}
    node = response.get("data", {}).get("node")
    
    if node and "fields" in node:
        for field in node["fields"]["nodes"]:
            if "name" in field:
                campos[field["name"]] = {
                    "id": field["id"],
                    "type": field["__typename"]
                }
    
    return campos

def obtener_status(item_id, campos):
    """Obtiene el valor del campo Status para un item"""
    query = """
    query($item: ID!) {
      node(id: $item) {
        ... on ProjectV2Item {
          fieldValues(first: 20) {
            nodes {
              __typename
              ... on ProjectV2ItemFieldSingleSelectValue {
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
                name
              }
            }
          }
        }
      }
    }
    """

    response = graphql(query, {"item": item_id})
    if not response:
        return None
        
    node = response.get("data", {}).get("node")
    if not node:
        return None

    for field_value in node["fieldValues"]["nodes"]:
        if field_value and field_value["__typename"] == "ProjectV2ItemFieldSingleSelectValue":
            field_info = field_value.get("field", {})
            if field_info and field_info.get("name") == "Status":
                return field_value.get("name")

    return None

def obtener_fecha_existente(item_id, field_name):
    """Obtiene el valor actual de un campo de fecha si existe"""
    query = """
    query($item: ID!) {
      node(id: $item) {
        ... on ProjectV2Item {
          fieldValues(first: 50) {
            nodes {
              __typename
              ... on ProjectV2ItemFieldDateValue {
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
                date
              }
            }
          }
        }
      }
    }
    """

    response = graphql(query, {"item": item_id})
    if not response:
        return None
        
    node = response.get("data", {}).get("node")
    if not node:
        return None

    for field_value in node["fieldValues"]["nodes"]:
        if field_value and field_value["__typename"] == "ProjectV2ItemFieldDateValue":
            field_info = field_value.get("field", {})
            if field_info and field_info.get("name") == field_name:
                return field_value.get("date")

    return None

def actualizar_fecha(item_id, field_name, date, campos):
    """Función base para actualizar un campo de fecha"""
    
    if field_name not in campos:
        print(f"Campo '{field_name}' no encontrado")
        return False
    
    field_id = campos[field_name]["id"]
    
    if campos[field_name]["type"] != "ProjectV2Field":
        print(f"'{field_name}' no es un campo de fecha")
        return False

    mutation = """
    mutation($project: ID!, $item: ID!, $field: ID!, $value: Date!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $project,
          itemId: $item,
          fieldId: $field,
          value: { date: $value }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
    """

    result = graphql(mutation, {
        "project": PROJECT_ID,
        "item": item_id,
        "field": field_id,
        "value": date
    })
    
    return result is not None and "errors" not in result

def actualizar_fecha_si_no_existe(item_id, field_name, date, campos):
    """Actualiza SOLO si el campo de fecha está vacío"""
    
    fecha_existente = obtener_fecha_existente(item_id, field_name)
    
    if fecha_existente:
        print(f"  {field_name} ya tiene fecha: {fecha_existente} (no se modifica)")
        return "ya_existia"
    
    if actualizar_fecha(item_id, field_name, date, campos):
        print(f"  {field_name} actualizado a {date}")
        return "actualizado"
    else:
        return "error"

def obtener_titulo_item(item):
    """Extrae el título del item"""
    content = item.get("content", {})
    if content:
        if "title" in content:
            return content["title"]
        elif "number" in content:
            return f"Issue #{content['number']}"
    return "Sin título"

def procesar_milestone(milestone_number):
    """Función principal que procesa un milestone específico"""
    print("=" * 60)
    print(f"PROCESANDO MILESTONE #{milestone_number}")
    print("=" * 60)
    
    # 1. Obtener campos del proyecto
    print("\nObteniendo campos del proyecto...")
    campos = obtener_campos_proyecto()
    
    if not campos:
        print("No se pudieron obtener los campos del proyecto")
        return
    
    print(f"Campos encontrados: {list(campos.keys())}")
    
    # 2. Obtener SOLO los items del milestone
    print("\nFiltrando items del proyecto por milestone...")
    items = obtener_items_project_filtrados(milestone_number)
    
    if not items:
        print(f"No se encontraron items para el milestone #{milestone_number}")
        return
    
    print(f"Total items a procesar: {len(items)}")
    
    # 3. Mapeo de estados a campos de fecha
    field_map = {
        "Todo": "TODO At",
        "In Progress": "In Progress At", 
        "In Review": "In Review At",
        "Done": "Done At"
    }
    
    # 4. Fecha actual
    today = datetime.date.today().isoformat()
    print(f"\nFecha a asignar (solo si está vacía): {today}")
    print("=" * 60)
    
    # 5. Procesar cada item
    actualizados = 0
    ya_existian = 0
    errores = 0
    saltados = 0
    
    for i, item in enumerate(items, 1):
        titulo = obtener_titulo_item(item)
        print(f"\n[{i}/{len(items)}] Procesando: {titulo[:50]}...")
        
        status = obtener_status(item["id"], campos)
        
        if not status:
            print(f"  No tiene campo Status")
            saltados += 1
            continue
            
        print(f"  Status actual: '{status}'")
        
        if status not in field_map:
            print(f"  Status '{status}' no está en el mapa de campos")
            saltados += 1
            continue
            
        campo_fecha = field_map[status]
        print(f"  Procesando campo: {campo_fecha}")
        
        resultado = actualizar_fecha_si_no_existe(item["id"], campo_fecha, today, campos)
        
        if resultado == "actualizado":
            actualizados += 1
        elif resultado == "ya_existia":
            ya_existian += 1
        elif resultado == "error":
            errores += 1
    
    # 6. Resumen final
    print("\n" + "=" * 60)
    print(f"RESUMEN MILESTONE #{milestone_number}")
    print("=" * 60)
    print(f"Fechas NUEVAS añadidas: {actualizados}")
    print(f"Ya tenían fecha (no se tocaron): {ya_existian}")
    print(f"Items saltados: {saltados}")
    print(f"Errores: {errores}")
    print(f"Total items procesados: {len(items)}")
    print("=" * 60)

if __name__ == "__main__":
    procesar_milestone(MILESTONE_NUMBER)
EOF

# Ejecutar el script Python
echo -e "${BLUE}Ejecutando script Python...${NC}"
export GH_TOKEN PROJECT_ID REPO_OWNER REPO_NAME MILESTONE_NUMBER
python "$PYTHON_SCRIPT"

# Limpiar
rm "$PYTHON_SCRIPT"