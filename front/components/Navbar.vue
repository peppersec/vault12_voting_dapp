<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="columns is-gapless is-vcentered">
        <div class="is-one-quater navbar-brand">
          <a href="https://vault12.com" class="navbar-item logo top">
            <img src="~/assets/img/logo-top@2x.png" alt="Vault12" />
          </a>
          <div
            class="navbar-burger burger"
            :class="{ 'is-active': isMenuActive }"
            @click="isMenuActive = !isMenuActive"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="navbar-menu" :class="{ 'is-active': isMenuActive }">
          <div class="navbar-start">
            <div class="columns is-gapless">
              <div class="column is-4 is-3-desktop">
                <a href="https://vault12.com/product" class="navbar-item">
                  Product
                </a>
                <a href="https://vault12.com/technology" class="navbar-item">
                  Technology
                </a>
                <a href="https://vault12.com/blog" class="navbar-item">
                  Blog
                </a>
              </div>
              <div class="column is-4 is-3-desktop">
                <a href="https://medium.com/vault12" class="navbar-item">
                  Blog
                </a>
                <a href="https://vault12.com/beta" class="navbar-item">
                  Beta
                </a>
                <a href="https://vault12.com/ico" class="navbar-item">
                  ICO
                </a>
              </div>
              <div class="column is-4 is-3-desktop">
                <nuxt-link to="/" class="navbar-item">
                  Voting
                </nuxt-link>
              </div>
            </div>
          </div>
          <div class="navbar-end">
            <div class="navbar-item top">
              <b-button type="is-primary" tag="a" href="https://vault12.com/beta" rounded>
                Download the Beta
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      isMenuActive: false
    }
  },
  watch: {
    $route: 'closeMenu'
  },
  methods: {
    closeMenu() {
      this.isMenuActive = false
    }
  }
}
</script>
