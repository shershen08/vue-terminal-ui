<template>
  <div id="app">
    <VueTerminal></VueTerminal>
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import VueTerminal from './components/vue-term/VueTerminal.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
    VueTerminal
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
