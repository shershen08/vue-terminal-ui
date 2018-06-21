# Vuejs terminal UI emulator

Vuejs component for displaying UI element that acts as console terminal. Actual terminal logic code forked from [Ptty](https://github.com/pachanka/Ptty).

[**Demo available here**](https://codepen.io/shershen08/pen/Keozqx)

## Install

`npm i vue-terminal-ui --save`

## Usage

```
// import plugin
import VueTerminal from 'vue-terminal-ui'

// add to components section
components{
    VueTerminal
}
// use in template
   <VueTerminal :intro="intro"
                console-sign="$"
                allow-arbitrary
                height="500px"
                @command="onCliCommand"></VueTerminal>
```

## Properties & Events

*props*

- `intro` (String) - intro text when terminal starts;
- `console-sign`(String) - starting symbol for each command line, eg. `my-folder/master $` or just `>>`;
- `allow-arbitrary`(Boolean) - allow type any command in addition to basic ones, then `@command` will be called;
- `height`(String) - UI block height, eg. `500px`;

*event*

- `@command` - callback function to call with command; accepts text, and resolve/reject callbacks

## ToDo

- get rid of jQuery dependancy

## License

MIT