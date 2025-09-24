// Custom Button Component for FIGR App
// 4 variants: primary-pink, outline-primary-pink, secondary-dark, outline-secondary-dark

Vue.component('custom-button', {
  props: {
    variant: {
      type: String,
      default: 'primary-pink',
      validator(value) {
        return ['primary-pink', 'outline-primary-pink', 'secondary-dark', 'outline-secondary-dark'].indexOf(value) !== -1
      }
    },
    small: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClasses() {
      return {
        'custom-btn': true,
        [`custom-btn--${this.variant}`]: true,
        'custom-btn--small': this.small,
        'custom-btn--disabled': this.disabled
      }
    }
  },
  template: `
    <button 
      :class="buttonClasses"
      :disabled="disabled"
      @click="$emit('click', $event)"
    >
      <slot></slot>
    </button>
  `
})

// Add CSS for the custom button variants
const style = document.createElement('style')
style.textContent = `
  .custom-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    text-transform: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .custom-btn--small {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    min-height: 2rem;
  }

  .custom-btn--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 1. Primary Pink - Solid pink background, white text */
  .custom-btn--primary-pink {
    background-color: #FF1FD6;
    color: white;
  }

  .custom-btn--primary-pink:hover:not(.custom-btn--disabled) {
    background-color: #E01BC2;
  }

  /* 2. Outline Primary Pink - Pink outline, pink text, dark background */
  .custom-btn--outline-primary-pink {
    background-color: transparent;
    color: #FF1FD6;
    border: 1px solid #FF1FD6;
  }

  .custom-btn--outline-primary-pink:hover:not(.custom-btn--disabled) {
    background-color: rgba(255, 31, 214, 0.1);
  }

  /* 3. Secondary Dark - Solid dark background, white text */
  .custom-btn--secondary-dark {
    background-color: #141414;
    color: white;
  }

  .custom-btn--secondary-dark:hover:not(.custom-btn--disabled) {
    background-color: #2a2a2a;
  }

  /* 4. Outline Secondary Dark - White outline, white text, dark background */
  .custom-btn--outline-secondary-dark {
    background-color: transparent;
    color: white;
    border: 1px solid #ADADAD;
  }

  .custom-btn--outline-secondary-dark:hover:not(.custom-btn--disabled) {
    background-color: rgba(255, 255, 255, 0.1);
  }
`
document.head.appendChild(style)
