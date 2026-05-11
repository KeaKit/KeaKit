# Diagrama de clases UML

```mermaid
classDiagram
direction TB


Item <|-- Article
Item <|-- Service
Item <|-- Kit


class Category {
    -Long id
    -String name
    -String description
    -CategoryStatus status
    -Double minPrice
    -Double maxPrice
}

class Item {
    <<abstract>>
    -Long id
    -String title
    -String description
    -String city
    -String country
    -Double pricePerMonth
    -LocalDate availableFrom
    -LocalDate availableUntil
}
class Article {
    -String imageUrl
    -ArticleStatus status
    -LocalDate purchaseDate
}
class Service {
    -ServiceStatus status
}
class Kit {
    -List~Item~ includedItems
}
class Supplier {
    -Long id
    -String companyName
    -String taxId
    -String contactEmail
    -String phone
}

class User {
    -Long id
    -String email
    -String password
    -String name
    -UserRole role
    -String phone
    -String address
    -String city
    -String country
}
class PaymentData {
    -Long id
    -String stripeCustomerId
    -String stripeAccountId
    -Boolean isVerified
}
class Wallet {
    -Long id
    -Double availableBalance
    -Double pendingBalance
    -String currency
}
class WalletTransaction {
    -Long id
    -Double amount
    -TransactionType type
    -LocalDateTime createdAt
    -String description
}


class Booking {
    -Long id
    -String name
    -String country
    -String city
    -LocalDate startDate
    -LocalDate endDate
    -Double totalPrice
    -String stripePaymentIntentId
    -KitStatus status
}


class Incident {
    -Long id
    -String title
    -String description
    -String photoUrl
    -LocalDateTime createdAt
    -IncidentStatus status
}

%% enums
class UserRole {
    <<enumeration>>
    USER
    ADMIN
    PROVIDER
    PILOT_USER
}
class ArticleStatus {
    <<enumeration>>
    AVAILABLE
    RENTED
    INACTIVE
}
class ServiceStatus {
    <<enumeration>>
    DRAFT
    ACTIVE
    UNAVAILABLE
}
class TransactionType {
    <<enumeration>>
    EARNING
    WITHDRAWAL
    PAYMENT
}
class KitStatus {
    <<enumeration>>
    PENDING
    PAID
    ACTIVE
    COMPLETED
    CANCELLED
}
class CategoryStatus {
    <<enumeration>>
    ACTIVE
    DRAFT
}
class IncidentStatus {
    <<enumeration>>
    OPEN
    RESOLVED
}

%% relaciones
User "1" *-- "0..1" PaymentData
User "1" *-- "1" Wallet
Wallet "1" *-- "0..*" WalletTransaction

Item "0..*" --> "1" User : owner
Service "0..*" --> "1" Supplier : provided_by

Booking "0..*" --> "1" User : tenant
Booking "0..*" --> "1..*" Item : contains

Item "0..*" --> "1" Category : category

Incident "0..*" --> "1" User : reported_by
```

## Historial de versiones

| Versión | Fecha      | Descripción                         | Autor(es)                |
| ------- | ---------- | ----------------------------------- | ------------------------ |
| 1.0.0   | 25/02/2026 | Versión inicial del diagrama        | José Luis Moraza Vergara |
| 2.0.0   | 28/02/2026 | Añadidas clases Incident y Category | José Luis Moraza Vergara |

---

**Redactado y realizado por:** José Luis Moraza Vergara  
**Fecha:** 28/02/2026  
**Versión:** 2.0.0
