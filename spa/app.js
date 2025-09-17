// HD6 config constants
var APP_CONFIG = {
  GST_RATE: 0.10,
  CURRENCY: '$'
};

// HD6 custom directive: autofocus on mount
Vue.directive('focus', {
  inserted: function (el) { try { el.focus(); } catch(e){} }
});

new Vue({
  el: '#app',
  data: {
    currentView: 'home',
    filters: { q: '', type: 'All' },
    sortOrder: 'normal', // HD6.3: sort selector (default to no sorting)
    products: [],
    cart: [],
    form: { fullName: '', email: '', mobile: '', street: '', suburb: '', postcode: '' },
    // HD6.3: User authentication
    user: null,
    loginForm: { username: '', password: '' },
    isLoginValid: false,
    // HD6.3: Enhanced user management
    registerForm: { firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: '' },
    users: [], // Store registered users
    wishlist: [], // User wishlist
    orderHistory: [], // Order history
    usernameExists: false
  },
  computed: {
    cartCount: function(){ return this.cart.reduce(function(a,c){return a+c.qty},0); },
    
    // Ref: P3.2 lookup1 + HD6.3 price sorting
    filtered: function(){
      var queryLower = this.filters.q.toLowerCase();
      var activeType = this.filters.type;
      var filtered = this.products.filter(function(p){
        var isTypeMatch = (activeType==='All') || (p.type===activeType);
        var isQueryMatch = !queryLower || p.name.toLowerCase().indexOf(queryLower) >= 0;
        return isTypeMatch && isQueryMatch;
      });
      
      // HD6.3: Sort by user selection
      if (this.sortOrder === 'low-to-high') {
        return filtered.sort(function(a, b) { return a.price - b.price; });
      } else if (this.sortOrder === 'high-to-low') {
        return filtered.sort(function(a, b) { return b.price - a.price; });
      } else {
        // normal - shuffle with seed for variety
        return this.shuffleArray(filtered, 42); // seed 42 for consistent shuffle
      }
    },
    groups: function(){
      var map = {};
      this.filtered.forEach(function(p){
        if(!map[p.type]) map[p.type] = [];
        map[p.type].push(p);
      });
      return Object.keys(map).map(function(k){ return { type:k, items: map[k] }; });
    },

    // Ref: C3.3 compute
    total: function(){
      return this.cart.reduce(function(sum,c){ return sum + c.price*c.qty; }, 0);
    },
    gst: function(){ return this.total * APP_CONFIG.GST_RATE; },
    grandTotal: function(){ return this.total + this.gst; },

    // Ref: C6.1 registration form validation
    // field validity flags
    isFullNameValid: function(){ return /^[A-Za-z\s]+$/.test(this.form.fullName || ''); },
    isEmailValid: function(){ return /.+@.+\..+/.test(this.form.email || ''); },
    isMobileValid: function(){ return /^04\d{8}$/.test(this.form.mobile || ''); },
    isPostcodeValid: function(){ return /^\d{4}$/.test(this.form.postcode || ''); },
    canSubmit: function(){
      var f = this.form;
      return !!(this.isFullNameValid && this.isEmailValid && this.isMobileValid && f.street && f.suburb && this.isPostcodeValid && this.cart.length>0);
    },
    
    // HD6.3: User authentication computed
    isLoggedIn: function(){ return !!this.user; },
    canCheckout: function(){ return this.isLoggedIn && this.cart.length > 0; },
    
    // HD6.3: Registration validation - must pass ALL individual validations
    isRegisterValid: function(){
      return this.isFirstNameValid && 
             this.isLastNameValid && 
             this.isEmailValid && 
             this.isUsernameValid && 
             this.isPasswordValid && 
             this.isConfirmPasswordValid;
    },
    
    // HD6.3: Individual field validation
    isFirstNameValid: function(){
      return !!this.registerForm.firstName;
    },
    
    isLastNameValid: function(){
      return !!this.registerForm.lastName;
    },
    
    isEmailValid: function(){
      var email = this.registerForm.email;
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    isUsernameValid: function(){
      return this.registerForm.username && !this.usernameExists;
    },
    
    isPasswordValid: function(){
      return this.registerForm.password && this.registerForm.password.length >= 6;
    },
    
    isConfirmPasswordValid: function(){
      return this.registerForm.confirmPassword && 
             this.registerForm.password === this.registerForm.confirmPassword;
    }
  },
  methods: {
    goTo: function(name){ this.currentView = name; },
    formatCurrency: function(n){ return APP_CONFIG.CURRENCY + n.toFixed(2); },
    
    // HD6.3: Shuffle array with seed for consistent randomization
    shuffleArray: function(array, seed) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      var random = this.seededRandom(seed);
      
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      
      return array;
    },
    
    // HD6.3: Seeded random number generator
    seededRandom: function(seed) {
      var x = Math.sin(seed) * 10000;
      return function() {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
      };
    },
    // Ref: P5.1 Lab post add/remove
    add: function(p){
      var idx = this.cart.findIndex(function(c){ return c.id===p.id; });
      if(idx===-1){ this.cart.push({ id:p.id, name:p.name, price:p.price, qty:1 }); }
      else { this.cart[idx].qty += 1; }
      this.saveCart();
    },
    
    // Ref: P5.1 Lab post add/remove
    incQty: function(i){ this.cart[i].qty += 1; this.saveCart(); },
    decQty: function(i){ if(this.cart[i].qty>1) { this.cart[i].qty -= 1; this.saveCart(); } },
    remove: function(i){ this.cart.splice(i,1); this.saveCart(); },
    submitOrder: function(){ alert('Submitted! (mock)'); this.currentView='home'; },
    
    // HD6.3: Simple user login with sessionStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage 
    login: function(){
      if (this.loginForm.username && this.loginForm.password) {
        // Check if user exists in registered users
        var foundUser = this.users.find(function(u){ 
          return u.username === this.loginForm.username; 
        }.bind(this));
        
        if (foundUser) {
          // User exists - create session
          this.user = { 
            username: foundUser.username, 
            name: foundUser.firstName + ' ' + foundUser.lastName,
            email: foundUser.email,
            loginTime: new Date().toISOString()
          };
          this.saveUser();
          this.loginForm = { username: '', password: '' };
          this.currentView = 'home';
        } else {
          alert('Username not found. Please register first.');
        }
      } else {
        alert('Please enter username and password');
      }
    },
    
    logout: function(){
      this.user = null;
      this.saveUser();
      this.currentView = 'home';
    },
    
    saveUser: function(){
      if (this.user) {
        sessionStorage.setItem('hd6_user', JSON.stringify(this.user));
      } else {
        sessionStorage.removeItem('hd6_user');
      }
    },
    
    loadUser: function(){
      var saved = sessionStorage.getItem('hd6_user');
      if (saved) {
        this.user = JSON.parse(saved);
      }
    },

    // HD6.3: User registration system
    register: function(){
      // Double-check all validations before proceeding
      if (this.isRegisterValid && 
          this.isFirstNameValid && 
          this.isLastNameValid && 
          this.isEmailValid && 
          this.isUsernameValid && 
          this.isPasswordValid && 
          this.isConfirmPasswordValid) {
        
        var newUser = {
          id: Date.now(),
          firstName: this.registerForm.firstName,
          lastName: this.registerForm.lastName,
          email: this.registerForm.email,
          username: this.registerForm.username,
          registrationDate: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers();
        this.user = newUser;
        this.saveUser();
        this.registerForm = { firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: '' };
        this.currentView = 'home';
      } else {
        alert('Please fix all validation errors before registering.');
      }
    },

    // HD6.3: Check username availability
    checkUsername: function(){
      if (this.registerForm.username) {
        this.usernameExists = this.users.some(function(u){ return u.username === this.registerForm.username; }.bind(this));
      } else {
        this.usernameExists = false;
      }
    },

    // HD6.3: Wishlist management
    toggleWishlist: function(product){
      var index = this.wishlist.findIndex(function(item){ return item.id === product.id; });
      if (index === -1) {
        this.wishlist.push(product);
      } else {
        this.wishlist.splice(index, 1);
      }
      this.saveWishlist();
    },

    isInWishlist: function(productId){
      return this.wishlist.some(function(item){ return item.id === productId; });
    },

    removeFromWishlist: function(productId){
      var index = this.wishlist.findIndex(function(item){ return item.id === productId; });
      if (index !== -1) {
        this.wishlist.splice(index, 1);
        this.saveWishlist();
      }
    },

    // HD6.3: Enhanced cart functionality
    addToCart: function(product){
      var existing = this.cart.find(function(item){ return item.id === product.id; });
      if (existing) {
        existing.qty++;
      } else {
        this.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, image: product.image });
      }
    },

    // HD6.3: Order processing
    processOrder: function(){
      if (this.canCheckout) {
        var order = {
          id: Date.now(),
          date: new Date().toISOString(),
          items: this.cart.slice(),
          total: this.cartTotal,
          user: this.user.username
        };
        
        this.orderHistory.push(order);
        this.saveOrderHistory();
        this.cart = [];
        this.currentView = 'profile';
      }
    },

    // HD6.3: Utility functions
    formatDate: function(dateString){
      return new Date(dateString).toLocaleDateString();
    },

    // HD6.3: Data persistence methods
    saveUsers: function(){
      try{ sessionStorage.setItem('hd6_users', JSON.stringify(this.users)); } catch(e){}
    },

    loadUsers: function(){
      var saved = sessionStorage.getItem('hd6_users');
      if (saved) {
        this.users = JSON.parse(saved);
      }
    },

    saveWishlist: function(){
      try{ sessionStorage.setItem('hd6_wishlist', JSON.stringify(this.wishlist)); } catch(e){}
    },

    loadWishlist: function(){
      var saved = sessionStorage.getItem('hd6_wishlist');
      if (saved) {
        this.wishlist = JSON.parse(saved);
      }
    },

    saveOrderHistory: function(){
      try{ sessionStorage.setItem('hd6_orders', JSON.stringify(this.orderHistory)); } catch(e){}
    },

    loadOrderHistory: function(){
      var saved = sessionStorage.getItem('hd6_orders');
      if (saved) {
        this.orderHistory = JSON.parse(saved);
      }
    },

    saveCart: function(){ try{ sessionStorage.setItem('cart', JSON.stringify(this.cart)); } catch(e){} }
  },
  created: function(){
    var self = this;
    // Load products via fetch with fallback to inline list
    fetch('products.json').then(function(r){ return r.json(); }).then(function(list){
      self.products = list;
    });
    
    // HD6.3: Load all user-related data
    this.loadUser();
    this.loadUsers();
    this.loadWishlist();
    this.loadOrderHistory();
    
    // Restore cart
    try{
      var raw = sessionStorage.getItem('cart');
      if(raw){ this.cart = JSON.parse(raw) || []; }
    } catch(e){}
  },
  watch: {
    cart: {
      handler: function(){ this.saveCart(); },
      deep: true
    },
    // HD6.3: Watch for username changes during registration
    'registerForm.username': function(){
      if (this.registerForm.username) {
        this.checkUsername();
      }
    },
    // HD6.3: Watch wishlist changes
    wishlist: {
      handler: function(){ this.saveWishlist(); },
      deep: true
    },
    // HD6.3: Watch order history changes
    orderHistory: {
      handler: function(){ this.saveOrderHistory(); },
      deep: true
    }
  }
});


