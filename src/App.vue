<template>
  <div id="app">
 {{text}}
    <VueTerminal :intro="intro"
                console-sign="$"
                allow-arbitrary
                height="500px"
                @command="onCliCommand"></VueTerminal>
   
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import VueTerminal from './components/vue-term/VueTerminal.vue'

const someService = {
  sendCommand: function(data){
    return new Promise((resolve) => {
 setTimeout(() => {
          resolve(`Dummy answer ... for ${data}`)
        }, 2000)
    })
  }
}

export default {
  name: 'app',
  data: function() {
return {
    text: '',
    intro: 'ui console',
    sendToAPI: false
  };
},
  methods: {
     onCliCommand (data, resolve, reject) {
      if (this.sendToAPI) {
        someService.sendCommand(data.text).then(response => {
          resolve(response.data.text)
        }).catch(error => {
          // deal with error
          reject(error.text)
        })
      } else {
        console.log(data.text)
        setTimeout(() => {
          resolve('Dummy answer ...')
        }, 2000)
      }
    },
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
