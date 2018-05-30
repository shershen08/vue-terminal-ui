<template>
  <div id="app">
 {{text}}
    <VueTerminal :intro="intro"
                console-sign="$"
                allow-arbitrary
                height="500px"
                @command="showComand"></VueTerminal>
   
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import VueTerminal from './components/vue-term/VueTerminal.vue'

export default {
  name: 'app',
  data: function() {
return {
    text: '',
    intro: 'ui console'
  };
},
  methods: {
    showComand(data){
      this.text = data
    }
  },
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
}
</style>
