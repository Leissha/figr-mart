Vue.component('home-view', {
  props: ['products', 'filters', 'sortOrder', 'categories', 'isLoggedIn', 'user', 'addedToCartItems'],
  
  computed: {
    // Ref: P3.2 lookup1 + HD6.3 price sorting - ascending, descending, or shuffle
    filtered() {
      var queryLower = this.filters.q.toLowerCase();
      var activeType = this.filters.type;
      var filtered = this.products.filter((p) => {
        var isTypeMatch = (activeType === 'All') || (p.type === activeType);
        var isQueryMatch = !queryLower || p.name.toLowerCase().indexOf(queryLower) >= 0;
        return isTypeMatch && isQueryMatch;
      });
      
      // Sort by user selection
      if (this.sortOrder === 'low-to-high') {
        return filtered.sort((a, b) => { return a.price - b.price; });
      } else if (this.sortOrder === 'high-to-low') {
        return filtered.sort((a, b) => { return b.price - a.price; });
      } else {
        // normal - shuffle with seed for variety
        return this.shuffleArray(filtered, 42);
      }
    }
  },

  methods: {
    isRecentlyAdded(productId) {
      return this.addedToCartItems && this.addedToCartItems.includes(productId);
    },
    add(p) {
      this.$emit('add-to-cart', p);
    },
    updateFilters(newFilters) {
      this.$emit('update-filters', newFilters);
    },
    updateSortOrder(newSortOrder) {
      this.$emit('update-sort-order', newSortOrder);
    },
    // HD6.3: Shuffle array with seed so user can see various products in the same random state (between session)
    shuffleArray(array, seed) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      var random = this.seededRandom(seed);
      
      while (0 !== currentIndex) {
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex -= 1;
        
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      
      return array;
    },
    // HD6.3: Seeded random number generator
    seededRandom(seed) {
      var x = Math.sin(seed) * 10000;
      return function() {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
      };
    },
  },
  template: `
    <div>
      <!-- Title / Series -->
      <div class="row">
        <div class="col-6 my-auto">
          <h1>SKULLPANDA you found me! series</h1>
          
          <!-- Search -->
          <div class="row mt-5">
            <div class="col-12 col-md-10 col-lg-8">
              <label for="home-q" class="form-label">Search product</label>
              <input id="home-q" type="text" class="form-control" placeholder="Search..." v-model="filters.q" v-focus>
            </div>
          </div>
        </div>
        <div class="col-6">
          <img src="assets/skullpanda/skullpanda8.jpg" class="img-fluid">
        </div>
      </div>

      <!-- Greeting -->
      <div v-if="isLoggedIn" class="row mb-2">
        <div class="col-12">
          <strong>Hello, {{ user.name }}!</strong>
        </div>
      </div>

      <!-- Type chips -->
      <div class="row mb-2">
        <div class="col-12 d-flex flex-wrap gap-2">
          <custom-button 
            v-for="category in categories"
            :key="category"
            :variant="filters.type===category ? 'primary-pink' : 'secondary-dark'"
            @click="updateFilters({...filters, type: category})"
            small>
            {{ category }}
          </custom-button>
          
          <!-- HD6.3 - Ref: P3.2 Price sort selector -->
          <div class="ms-auto d-flex align-items-center">
            <select id="sortSelect" class="form-select form-select-sm" style="width: auto;" v-model="sortOrder" @change="updateSortOrder($event.target.value)">
              <option value="normal"><i class="bi bi-filter"></i> Sort by price</option>
              <option value="high-to-low">High to Low</option>
              <option value="low-to-high">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Product grid (flat list from filtered) -->
      <div class="row g-3" aria-live="polite" aria-label="Product search results">
        <div class="col-6 col-lg-3" v-for="p in filtered" :key="'home-'+p.id">
          <div class="flex-column">
            <div class="mb-2">
              <div class="ratio ratio-1x1">
                <img v-if="p.image" :src="p.image" :alt="p.name" class="w-100 h-100 object-fit-cover rounded-2">
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="fw-semibold">{{ p.name }}</div>
              <custom-button
                :variant="isRecentlyAdded(p.id) ? 'success' : 'primary-pink'"
                class="mt-2"
                @click="add(p)"
                small>
                <i v-if="isRecentlyAdded(p.id)" class="bi bi-check-lg me-1"></i>
                {{ isRecentlyAdded(p.id) ? 'Added!' : 'Add to Cart' }}
              </custom-button>
            </div>
            <div class="text-muted">{{ p.price | currency }}</div>
          </div>
        </div>
      </div>
    </div>
  `
});
