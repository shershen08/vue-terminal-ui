<template>
  <div id="app">
    <VueTerminal :intro="intro"
            console-sign="$"
            allow-arbitrary
            height="500px"
            @command="onCliCommand"></VueTerminal>
  </div>
</template>

<script>
import VueTerminal from '../index'

export default {
  name: 'app',
  components: {
    VueTerminal
  },
  methods: {
     onCliCommand(data, resolve, reject){
      // typed command is available in data.text
      // don't forget to resolve or reject the Promise
      setTimeout(()=> {
        resolve('')
      }, 300)
    }
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
