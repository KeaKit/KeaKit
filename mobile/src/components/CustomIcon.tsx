import { createIconSet } from '@expo/vector-icons'; 
import glyphMap from '../../assets/fonts/Ionicons.json';

// Argumentos: (Mapa de nombres, Nombre de la fuente, Ruta al archivo)
const CustomIcon = createIconSet(glyphMap, 'Ionicons', 'Ionicons.ttf');

export default CustomIcon;