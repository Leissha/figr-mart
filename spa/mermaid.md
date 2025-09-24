# HD6 Vue.js SPA Architecture - Complete Mermaid Diagrams

## 1. Overall System Architecture

```mermaid
graph TB
    subgraph "HD6 Vue.js SPA Architecture"
        subgraph "Root App (app.js) - Single Source of Truth"
            AppData[["📊 APP DATA<br/>• currentView: string<br/>• user: Object|null<br/>• products: Array<br/>• cart: Array<br/>• filters: {q, type}<br/>• sortOrder: string<br/>• categories: Array<br/>• users: Array<br/>• orderHistory: Array<br/>• loginForm/registerForm"]]

            AppComputed[["🔄 COMPUTED<br/>• isLoggedIn: !!user<br/>• cartCount: sum(cart.qty)<br/>• total: sum(cart.price*qty)<br/>• gst: total * 0.10<br/>• grandTotal: total + gst<br/>• canCheckout: isLoggedIn && cart.length"]]

            AppMethods[["⚙️ METHODS<br/>• Navigation: goTo*()<br/>• Auth: login(), logout(), register()<br/>• Cart: add(), incQty(), decQty(), remove()<br/>• Filters: updateFilters(), updateSortOrder()<br/>• Order: processOrder()<br/>• Storage: save*/load* methods"]]
        end

        subgraph "View Router (v-if switching)"
            ViewSwitch["🎯 currentView controls which view renders"]
        end

        subgraph "Components Layer"
            NavBar["🧭 nav-bar<br/>Props: isLoggedIn, cartCount<br/>Emits: go-to-*, logout"]
            CustomBtn["🔘 custom-button<br/>Props: variant, small, disabled<br/>4 variants with CSS injection"]
        end

        subgraph "Views Layer"
            HomeView["🏠 home-view<br/>Props: products, filters, sortOrder, categories, isLoggedIn, user<br/>Emits: add-to-cart, update-filters, update-sort-order<br/>Computed: filtered (search+sort logic)"]

            CartView["🛒 cart-view<br/>Props: cart, total, gst, grandTotal, isLoggedIn, canCheckout<br/>Emits: inc-qty, dec-qty, remove-item, go-to-checkout"]

            LoginView["🔐 login-view<br/>Props: loginForm<br/>Emits: login, go-to-home, go-to-register"]

            RegisterView["📝 register-view<br/>Props: registerForm, validation rules<br/>Emits: register, go-to-home, go-to-login<br/>Uses: Vuetify v-form validation"]

            ProfileView["👤 profile-view<br/>Props: user, orderHistory"]

            CheckoutView["💳 checkout-view<br/>Props: user, cart, totals<br/>Emits: process-order, go-to-cart"]
        end

        subgraph "Storage Layer"
            SessionStorage["💾 SessionStorage<br/>Keys: hd6_user, hd6_users, hd6_orders, cart<br/>Persistence: User session, cart, order history"]
            ProductsJSON["📄 products.json<br/>External data source"]
        end

        subgraph "External Libraries"
            Vue2["Vue.js 2.6.14"]
            Vuetify["Vuetify 2.6.14<br/>Used for: dropdowns, forms"]
            Bootstrap["Bootstrap 5.3.2<br/>CSS framework + icons"]
        end
    end

    %% Data flow connections
    AppData --> ViewSwitch
    ViewSwitch --> HomeView
    ViewSwitch --> CartView
    ViewSwitch --> LoginView
    ViewSwitch --> RegisterView
    ViewSwitch --> ProfileView
    ViewSwitch --> CheckoutView

    %% Component relationships
    NavBar --> AppMethods
    HomeView --> AppMethods
    CartView --> AppMethods
    LoginView --> AppMethods
    RegisterView --> AppMethods
    CheckoutView --> AppMethods

    %% Storage connections
    AppMethods --> SessionStorage
    ProductsJSON --> AppData

    %% Library dependencies
    Vue2 --> AppData
    Vuetify --> RegisterView
    Vuetify --> NavBar
    Bootstrap --> CustomBtn
```

## 2. Event Flow & Communication Architecture

```mermaid
sequenceDiagram
    participant User
    participant NavBar
    participant RootApp
    participant HomeView
    participant CartView
    participant Storage

    Note over RootApp: Props Down, Events Up Pattern

    %% Navigation Event Flow
    User->>NavBar: Click "Cart"
    NavBar->>RootApp: $emit('go-to-cart')
    RootApp->>RootApp: currentView = 'cart'
    RootApp->>CartView: :cart="cart" :total="total" (props)

    %% Add to Cart Flow
    User->>HomeView: Click "Add to Cart"
    HomeView->>RootApp: $emit('add-to-cart', product)
    RootApp->>RootApp: add(product) method
    RootApp->>RootApp: cart.push({...}) or qty++
    RootApp->>Storage: saveCart()
    RootApp->>NavBar: :cart-count="cartCount" (computed prop)

    %% Authentication Flow
    User->>NavBar: Click "Profile > Logout"
    NavBar->>RootApp: $emit('logout')
    RootApp->>RootApp: user = null
    RootApp->>Storage: saveUser() - removes session
    RootApp->>RootApp: currentView = 'home'
    RootApp->>NavBar: :is-logged-in="false" (computed)

    %% Filter/Sort Flow
    User->>HomeView: Change sort dropdown
    HomeView->>RootApp: $emit('update-sort-order', newOrder)
    RootApp->>RootApp: sortOrder = newOrder
    RootApp->>HomeView: :sort-order="sortOrder" (prop)
    HomeView->>HomeView: filtered computed recalculates
```

## 3. V-Directive Usage Map

```mermaid
graph LR
    subgraph "V-Directive Architecture"
        subgraph "Conditional Rendering (v-if)"
            VIf1["nav-bar.js:31<br/>v-if='isLoggedIn'<br/>→ Profile dropdown"]
            VIf2["nav-bar.js:57<br/>v-if='!isLoggedIn'<br/>→ Login button"]
            VIf3["home-view.js:81<br/>v-if='isLoggedIn'<br/>→ User greeting"]
            VIf4["index.html:42-112<br/>v-if='currentView==='<br/>→ View switching"]
            VIf5["cart-view.js:39<br/>v-if='cart.length===0'<br/>→ Empty cart message"]
        end

        subgraph "List Rendering (v-for)"
            VFor1["home-view.js:91<br/>v-for='category in categories'<br/>→ Category filter buttons"]
            VFor2["home-view.js:112<br/>v-for='p in filtered'<br/>→ Product grid display"]
            VFor3["cart-view.js:40<br/>v-for='(c,i) in cart'<br/>→ Cart item rows"]
        end

        subgraph "Two-Way Binding (v-model)"
            VModel1["home-view.js:71<br/>v-model='filters.q'<br/>→ Search input field"]
            VModel2["home-view.js:101<br/>v-model='sortOrder'<br/>→ Sort dropdown"]
            VModel3["register-view.js:33-72<br/>v-model='registerForm.*'<br/>→ All form fields"]
            VModel4["login-view.js<br/>v-model='loginForm.*'<br/>→ Username/password"]
        end

        subgraph "Event Handling (v-on/@)"
            VOn1["index.html:31-35<br/>@go-to-*, @logout<br/>→ Navigation events"]
            VOn2["index.html:50-52<br/>@add-to-cart, @update-*<br/>→ Business logic events"]
            VOn3["home-view.js:94<br/>@click='updateFilters'<br/>→ Category selection"]
            VOn4["cart-view.js:44-46<br/>@click='incQty/decQty'<br/>→ Quantity controls"]
        end

        subgraph "Custom Directives"
            VCustom["home-view.js:71<br/>v-focus<br/>→ Auto-focus search input<br/>(app.js:8-10 definition)"]
        end

        subgraph "Property Binding (v-bind/:)"
            VBind1["Multiple files<br/>:disabled='!valid'<br/>→ Button state control"]
            VBind2["home-view.js:93<br/>:variant='condition ? a : b'<br/>→ Dynamic button styles"]
            VBind3["register-view.js:35<br/>:rules='validationRules'<br/>→ Vuetify form validation"]
        end
    end
```

## 4. Storage & Persistence Architecture

```mermaid
graph TB
    subgraph "Storage Architecture"
        subgraph "SessionStorage Keys & Data"
            UserSession["🔑 'hd6_user'<br/>{username, name, email, loginTime}<br/>Cleared on browser close"]
            UserDB["🔑 'hd6_users'<br/>[{id, name, username, email, registrationDate}]<br/>Persistent user database"]
            Orders["🔑 'hd6_orders'<br/>[{id, date, items, total, user}]<br/>Order history for all users"]
            CartData["🔑 'cart'<br/>[{id, name, price, qty}]<br/>Shopping cart persistence"]
        end

        subgraph "Storage Methods (app.js:218-245)"
            Generic["⚙️ Generic Methods<br/>• saveToStorage(key, data)<br/>• loadFromStorage(key, default)<br/>Error handling with try/catch"]

            Specific["⚙️ Specific Methods<br/>• saveUser() / loadUser()<br/>• saveUsers() / loadUsers()<br/>• saveCart() / loadCart()<br/>• saveOrderHistory() / loadOrderHistory()"]
        end

        subgraph "Lifecycle Integration"
            Created["📅 created() Hook (app.js:249)<br/>1. fetch('products.json')<br/>2. loadUser()<br/>3. loadUsers()<br/>4. loadOrderHistory()<br/>5. loadCart()"]

            Reactive["🔄 Reactive Updates<br/>• After login → saveUser()<br/>• After cart change → saveCart()<br/>• After order → saveOrderHistory()<br/>• After logout → clear session"]
        end

        subgraph "External Data"
            ProductsFile["📄 products.json<br/>Product catalog<br/>Fetched on app creation"]
        end
    end

    %% Connections
    Generic --> Specific
    Specific --> UserSession
    Specific --> UserDB
    Specific --> Orders
    Specific --> CartData
    Created --> ProductsFile
    Created --> Specific
    Reactive --> Specific
```

## 5. Component Props & Events Detail

```mermaid
graph TB
    subgraph "Component Communication Details"
        subgraph "nav-bar Component"
            NavProps["📥 PROPS<br/>• isLoggedIn: Boolean<br/>• cartCount: Number"]
            NavEvents["📤 EVENTS<br/>• go-to-home<br/>• go-to-profile<br/>• go-to-login<br/>• go-to-cart<br/>• logout"]
            NavFeatures["✨ FEATURES<br/>• Vuetify v-menu dropdown<br/>• Conditional rendering<br/>• Bootstrap icons"]
        end

        subgraph "home-view Component"
            HomeProps["📥 PROPS<br/>• products: Array<br/>• filters: {q, type}<br/>• sortOrder: String<br/>• categories: Array<br/>• isLoggedIn: Boolean<br/>• user: Object"]
            HomeEvents["📤 EVENTS<br/>• add-to-cart(product)<br/>• update-filters(filters)<br/>• update-sort-order(order)"]
            HomeComputed["🔄 COMPUTED<br/>• filtered(): search + sort logic<br/>• Uses seededRandom() for shuffle"]
            HomeFeatures["✨ FEATURES<br/>• v-focus directive<br/>• Dynamic category buttons<br/>• Product grid display<br/>• Price sorting"]
        end

        subgraph "cart-view Component"
            CartProps["📥 PROPS<br/>• cart: Array<br/>• total: Number<br/>• gst: Number<br/>• grandTotal: Number<br/>• isLoggedIn: Boolean<br/>• canCheckout: Boolean"]
            CartEvents["📤 EVENTS<br/>• inc-qty(index)<br/>• dec-qty(index)<br/>• remove-item(index)<br/>• go-to-checkout<br/>• go-to-login"]
            CartFeatures["✨ FEATURES<br/>• Responsive table<br/>• Quantity controls<br/>• Price calculations<br/>• Empty cart state"]
        end

        subgraph "register-view Component"
            RegProps["📥 PROPS<br/>• registerForm: Object<br/>• valid: Boolean<br/>• *Rules: Array (validation)"]
            RegEvents["📤 EVENTS<br/>• register<br/>• go-to-home<br/>• go-to-login"]
            RegFeatures["✨ FEATURES<br/>• Vuetify v-form validation<br/>• Real-time validation<br/>• Password confirmation<br/>• Responsive layout"]
        end

        subgraph "custom-button Component"
            BtnProps["📥 PROPS<br/>• variant: String (4 options)<br/>• small: Boolean<br/>• disabled: Boolean"]
            BtnEvents["📤 EVENTS<br/>• click (pass-through)"]
            BtnFeatures["✨ FEATURES<br/>• 4 style variants<br/>• CSS injection<br/>• Slot content<br/>• Hover states"]
        end
    end
```

## 6. Application Flow & User Journey

```mermaid
stateDiagram-v2
    [*] --> AppCreated

    AppCreated --> LoadingData
    LoadingData --> HomeView : Data loaded

    HomeView --> LoginView : Click Login
    HomeView --> CartView : Click Cart
    HomeView --> HomeView : Search/Filter/Sort

    LoginView --> HomeView : Cancel
    LoginView --> RegisterView : Go to Register
    LoginView --> HomeView : Login Success

    RegisterView --> LoginView : Go to Login
    RegisterView --> HomeView : Register Success

    CartView --> HomeView : Continue Shopping
    CartView --> LoginView : Need Login
    CartView --> CheckoutView : Logged in + Items

    CheckoutView --> CartView : Back to Cart
    CheckoutView --> ProfileView : Order Complete

    ProfileView --> HomeView : Continue Shopping
    ProfileView --> LoginView : Logout

    state HomeView {
        [*] --> DisplayProducts
        DisplayProducts --> FilterProducts : Apply Filter
        FilterProducts --> SortProducts : Change Sort
        SortProducts --> AddToCart : Click Add
        AddToCart --> DisplayProducts : Update Cart Count
    }

    state CartView {
        [*] --> DisplayCartItems
        DisplayCartItems --> ModifyQuantity : +/- buttons
        DisplayCartItems --> RemoveItem : Remove button
        ModifyQuantity --> DisplayCartItems : Update totals
        RemoveItem --> DisplayCartItems : Recalculate
    }
```

## Key Architectural Patterns

- **Single Source of Truth**: All state lives in root app.js
- **Unidirectional Data Flow**: Props down, events up
- **View-Based Routing**: Simple v-if switching instead of Vue Router
- **Persistent State**: SessionStorage for user data, maintains cart across sessions
- **Component Communication**: $emit for child-to-parent, props for parent-to-child
- **Custom Directives**: v-focus for UX enhancement
- **Vuetify Integration**: For complex UI components (dropdowns, forms)
- **Computed Properties**: Reactive calculations (cartCount, totals, isLoggedIn)

This architecture provides clear separation of concerns while maintaining simplicity for a single-page application.