<template>
  <div class="wrapper">
    <Navbar />
    <div class="main-content">
      <nuxt />
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default {
  components: {
    Navbar,
    Footer
  },
  async mounted() {
    try {
      await this.$store.dispatch('metamask/askPermission')
      this.$store.dispatch('metamask/fetchGasPrice', {})
      this.$store.dispatch('voting/fetchStats', {})
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
      this.$snackbar.open({
        duration: 5000,
        message: 'Please use metamask.io or TrustWallet',
        type: 'is-danger',
        position: 'is-top',
        indefinite: true,
        queue: false
      })
      this.$store.dispatch('voting/fetchStats', {})
    }
  }
}
</script>
