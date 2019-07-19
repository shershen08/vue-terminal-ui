import jQuery from 'jquery'
/**
 * Initial code from
 * @author : Pachanka <social@pachanka.org>
 * @url    : http://goto.pachanka.org/ptty/docs
 * @desc   : Ptty (Pseudo teletype). A terminal emulator plugin for jQuery. 
 **/

( function( $ ) {
     
    /**
    * @method : Ptty
    * @public
    * @desc   : Sets up the terminal on the jQuery object that represents a group of HTML nodes
    * @args   : object
    **/
    $.fn.Ptty = function(options) {

        var version = '0.0.5 beta';

        /**
        * @function : get_defaults
        * @returns  : Object
        * @desc     : Returns Global Defaults
        * */
        var get_defaults = function() {

            return {
                // The HTTP Method that will be used for Ajax Requests
                ajax_options : {
                    url  : window.location.pathname,
                    type : 'POST',
                },

                allowArbitrary: false,

                passCommand: null,

                // The GET/POST parameter that should be used to make requests
                param        : 'cmd',

                // The Primary Prompt (it's better to edit this using css)
                ps           : '$',

                // Caret (the cursor)
                caret        : '\u25ae', // Black Vertical Rectangle ▮
                caret_blink  : 800,

                // use native css and default theme name.
                theme        : 'boring',

                // Register help, clear and history commands
                native_cmds  : true,

                // Is Autocomplete feature Enabled
                autocomplete : true,

                // Number of entries to be stored in history (0 = off)
                history_max  : 800,

                // Autofocus on input on load
                autofocus    : true,

                // Run this function before every command
                before_cmd   : false,

                // Run this function after every command
                after_cmd    : false,

                // Language
                i18n : {
                    // Message to be shown when the terminal is first 
                    welcome : 'Ptty ('+version+').<br> Type <b>help</b> to list the available commands.',
                    // When command is not found: "CMD" will be replaced
                    error_not_found : 'Command not found.',
                    // If command method is not valid
                    error_bad_method : 'Invalid command method.',
                    // Ajax response failed
                    error_ajax : 'Server error.',
                }
            };
        };

        // The public methods container
        var _public = {};

        // jQuery Plugin
        this.each( function() {

            // Ptty holder element
            var el = $(this);

            /**
            * @property : commands
            * @desc     : Stores command name and action to be taken when user enters a command.
            **/
            var commands = {};

            /**
            * @property : response
            * @desc     : Stores the methods for command responses.
            **/
            var responses = {};

            /**
            * @property : callbacks
            * @desc     : Callbacks object that stores callback methods.
            **/
            var callbacks = {};

            /**
            * @property : callbefores
            * @desc     : Calls function before running through Ptty.
            **/
            var callbefores = {};

            /**
            * @property : history
            * @desc     : Mantains the record of called commands
            **/
            var history  = [];

            /**
            * @property : cmd_opts
            * @desc     : Options of current command.
            **/
            var cmd_opts = {
                // The ps value
                ps    : null,
                // The command string
                in    : null,
                // The output of the command.
                out   : null,
                // The last command (can be object)
                last  : null,
                // Do this next (can be object)
                next : null,
                // All the rest of data.
                data : null
            };

            // Merge options with defaults (if any)
            var settings = $.extend( true, get_defaults(), options );

            /**
            * @method   : get_terminal
            * @desc     : Returns the terminal element or a sub-element
            **/
           _public.get_terminal = function(selector){
                return (!selector) ? el : el.find(selector);
            }

            /**
            * @method   : ptty_native_commands
            * @desc     : Registers the native Ptty commands
            **/
           _public.native_commands = function(){

            _public.register('command',{
                    name : 'clear',
                    method : function(cmd) {
                        cmd.last = '';
                        cmd.out = ''; 
                        return cmd;
                    },
                    options : [],
                    help : 'Cleans the screen leaving a new command prompt ready.'
                });
                _public.register('callback',{
                    name : 'clear',
                    method : function(cmd) {
                        el.find('.content').html('');
                        return cmd;
                    }
                });

                _public.register('command',{
                        name : 'history',
                        method : function(cmd) {
                            if(cmd.hasOwnProperty('clear')){
                                history = [];
                                cmd.out = 'History cleared.'
                            }else if(history.length > 0){
                                var i;
                                cmd.out = '<ul>';
                                for(i in history) {
                                    cmd.out += '<li>' + history[i] + '</li>';
                                }
                                cmd.out += '</ul>';
                            }
                            return cmd;
                        },
                        options : ['clear'],
                        help : 'Shows list of typed in commands. Type <i>history clear</i> to clear your history.'
                });

                _public.register('command', {
                        name : 'help',
                        method : function(cmd) {
                            if(typeof cmd[1] === 'string' && cmd[1].length > 0){
                                if(cmd.hasOwnProperty('-a') || cmd.hasOwnProperty('--all')){
                                    cmd.out = '<b>Available commands:</b></br></br><ul>'
                                    for( var i in commands ){
                                        cmd.out += '<li><p><b>'+i+'</b> - ';
                                        cmd.out += commands[i].help+'</p></br></li>';
                                    }
                                    cmd.out += '</ul>'+"\n";
                                }else if(typeof commands[cmd[1]] !== 'undefined'){
                                    cmd.out  = '<b>'+cmd[1]+'</b> - ';
                                    if(commands[cmd[1]].help !== ''){
                                        cmd.out += commands[cmd[1]].help+"\n";    
                                    }else{
                                        cmd.out += 'No help entry available.'+"\n";
                                    }
                                }else{
                                    cmd.out = 'help: The "' + cmd[1] + '" option does not exist.'+"\n";
                                }
                            }else{
                                cmd.out  = 'Use "help [comand name]" to display specific info about a command.</br>'+"\n";
                                cmd.out += 'Available commands are:</br><ul class="sq-li">';
                                for( i in commands ){
                                    cmd.out += '<li>'+i+'</li>';
                                }
                                cmd.out += '</ul>'+"\n";   
                            }
                            return cmd;
                        },
                        options : [1, '-a', '--all'],
                        help : 'Displays a list of useful information. Usage: '+
                        '<i>help command-name</i> to show <i>command-name</i>\'s help.'+
                        '<i>help -a</i> or <i>help --all</i> to display all help.'
                });
            };

            /**
            * @method   : ptty_native_responses
            * @desc     : Registers the native Ptty commands
            **/
           _public.native_responses = function(cmd_opts){
                for(var opt in cmd_opts){
                    if (cmd_opts.hasOwnProperty(opt)) {
                        _public.register('response', {
                            name : opt,
                            method : function(cmd){ 
                                cmd_opts[opt] = cmd[opt];
                                return cmd;
                            }
                        });
                    }
                }
            }

            /**
            * @method : run_command
            * @desc   : Takes a string and runs it as a command.
            **/
           _public.run_command = function(command, mute){
                quiet = mute;
                cmd_start(command);
            }
            
            /**
            * @method : echo
            * @desc   : Takes a string and 
            **/
           _public.echo = function(out_str, no_scroll){
                if(out_str){
                    el.find('.content')
                        .append('<div><div class="cmd_out">'+out_str+'</div></div>');
                }
                if(!no_scroll){
                    scroll_to_bottom();    
                }
                
            }

            /**
            * @method : ptty_change_settings
            * @desc   : Edits a property from the settings (not all settings are editable)
            **/
           _public.change_settings = function(settings_obj){
                $.extend(true, settings, settings_obj);
            }

            /**
            * @method : ptty_unregister
            * @desc   : Removes a property from the method stack.
            **/
           _public.unregister = function(method_type, method_name){
                var flag = false;
                if(typeof method_name == 'object' && method_name.hasOwnProperty('name')){
                    method_name = method_name.name;
                }

                if(method_type == 'callbefore' && callbefores.hasOwnProperty(method_name)){
                    flag = true;
                    delete callbefores[method_name];
                }else if(method_type == 'command' && commands.hasOwnProperty(method_name)){
                    flag = true;
                    delete commands[method_name];
                }else if(method_type == 'response' && responses.hasOwnProperty(method_name)){
                    flag = true;
                    delete responses[method_name];
                }else if(method_type == 'callback' && callbacks.hasOwnProperty(method_name)){
                    flag = true;
                    delete callbacks[method_name];
                }
                return flag;
            }

            /**
            * @method : register
            * @desc   : Adds a method to the specified method stack.
            * @return : boolean. True on success.
            **/
           _public.register = function(method_type, obj){
                var ret = false;
                if(obj){
                    var method_name = (obj.hasOwnProperty('name')) ? obj.name : false,
                    method_exe = (obj.hasOwnProperty('method')) ? obj.method : false,
                    method_options = (obj.hasOwnProperty('options')) ? obj.options : [],
                    method_help = (obj.hasOwnProperty('help')) ? obj.help : '';

                    if(method_type == 'callbefore' && typeof method_exe === 'function' ){
                            callbefores[ method_name ] = method_exe;
                            ret = true;

                    }else if(method_type == 'command'
                        && ( typeof method_exe === 'string' || typeof method_exe === 'function' )){
                            commands[ method_name ] = {'help' : method_help, 'options' : method_options, 'exe' : method_exe};
                            ret = true;

                    }else if(method_type == 'response' && typeof method_exe === 'function'){
                            responses[method_name] = method_exe;
                            ret = true;

                    }else if(method_type == 'callback' && typeof method_exe === 'function' ){
                            callbacks[ method_name ] = method_exe;
                            ret = true;
                    }
                }

                return ret;
            };

            /**
            * @method : ptty_set_command_option
            * @desc   : Edits the cmd_opts property.
            * @option_obj : An object containing any of the cmd_opts attributes.
            **/
           _public.set_command_option = function(option_obj){
                return $.extend(true, cmd_opts, option_obj);
            };

            /**
            * @method : ptty_get_command_option
            * @desc   : Returns the cmd_opts value for the property requested.
            * @options_mix   : The name (str) or names (arr) of the wanted properties.
            **/
           _public.get_command_option = function(options_mix){
                var out;
                if(typeof options_mix === 'string'){
                    out = (cmd_opts.hasOwnProperty(options_mix)) ? cmd_opts[options_mix] : false;
                }else if(typeof options_mix === 'object'){
                    out = {};
                    for (var i = options_mix.length - 1; i >= 0; i--) {
                        if(typeof cmd_opts[options_mix[i]] !== 'undefined'){
                            out[options_mix[i]] = cmd_opts[options_mix[i]];
                        }
                    }
                }else{
                    out = cmd_opts;
                }

                return out;
            };

            /**
            * @method : ptty_tokenize
            * @desc   : Will attempt to return an array where text has been tokenized in a command line fashion.
            * @command: A string, for example: first -s second "argument.sh -xyz" --foo="bar \'baz\' 123" -abc
            * @array  : An array with the options to look for eg. [1,'--option','-x','-y','-z']
            * (integers in the options array return their position in the command entered)
            **/
           _public.tokenize = function(command, options_arr){
                var out = {};
                var cmd = $.trim(command).split( /\s+/ );

                if(typeof cmd[0] === 'undefined' || cmd[0] === ''){
                    out = false;
                }else if(typeof options_arr !== 'undefined'){
                    var option = false, value = false, quote_type = false, quote_open = false,
                    first_char = false, last_char = false, before_last = false;
                    var wildcards = options_arr.filter(function(opt){
                        if(typeof opt === 'number' && opt > 0 && typeof cmd[opt] !== 'undefined'){
                            out[opt] = cmd[opt];
                            return opt;
                        }
                    });
                    // remove wildcards from options_arr
                    options_arr = $(options_arr).not(wildcards).get();
                    for (var i = 0; i < cmd.length; i++) {
                        first_char = cmd[i].charAt(0);
                        last_char = cmd[i].slice(-1);
                        // before last to detect escapes
                        before_last = cmd[i].charAt(cmd[i].length - 2);
                        if($.inArray( cmd[i], options_arr ) >= 0){
                            // Get option
                            option = cmd[i];
                            value = false;
                        }else if(first_char == '"' && quote_open === false && last_char !== '"'){
                            quote_type = '"';
                            quote_open = true; 
                            value = cmd[i];
                        }else if(first_char == "'" && quote_open === false && last_char !== "'"){
                            quote_type = "'";
                            quote_open = true;
                            value = cmd[i];
                        }else if(last_char == quote_type && quote_open === true && before_last+last_char !== '\\'+quote_type){
                            quote_open = false;
                            value += ' '+cmd[i];
                            // Trim & Strip any ecaping slashes
                            value = $.trim(value.substring(1).slice(0,-1).replace(/\\(.)/mg, "$1"));
                        }else if(quote_open === true){
                            value += ' '+cmd[i];
                        }else{
                            if((first_char == "'" && last_char == "'") || (first_char == '"' && last_char == '"')){
                                // Remove wrapping quotes
                                 value = $.trim(cmd[i].substring(1).slice(0,-1));
                            }else{
                                value = cmd[i];    
                            }
                        }
                        // Add to output
                        if(option && quote_open === false){
                            out[option] = value;
                        }
                    }
                }else{
                    out[cmd[0]] = cmd;
                }
                return out;
            }

            // cleanup
            el.html('');
            
            // current history position
            var hcurrent = null;
            
            // current running command
            var cmd_name = null; 

            // the tokenized command
            var cmd_obj  = {};

            // Some markup
            el.append(
             //   '<div class="loading"><span></span></div>'+
                '<div class="content">'+
                    '<div>' + settings.i18n.welcome + '</div>'+
                '</div>'+
                '<div class="prompt">'+
                    '<div class="input" contenteditable '+
                        'spellcheck="false" '+
                        'data-caret="'+settings.caret+'" '+
                        'data-ps="'+settings.ps+'">'+
                    '</div>'+
                '</div>'
            );

            var input   = el.find('.prompt .input');
            var content = el.find('.content');
            var loading = el.find('.loading');

            // Setup styles.
            el.attr('data-theme', settings.theme).addClass( settings.theme );

            var blinking = settings.autofocus;

            // temporary switches for subroutines
            var tab_comp = settings.autocomplete; 
            var save_to_history = settings.history_max;

            // Set caret on the prompt
            if(settings.autofocus){
                input.focus();
            } 
            
            el.bind('focus click', function(){
                var text = '';
                if (typeof window.getSelection != "undefined") {
                    text = window.getSelection().toString();
                } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
                    text = document.selection.createRange().text;
                }
                if(text == ''){
                    caret_to_end();
                }
            });

            input.click(function() {
                caret_to_end();
            });
            input.bind('blur', function(){
                blinking = false;
            });
            if(settings.caret_blink > 0){
                setInterval(function() {
                    if(settings.caret_blink > 0 && blinking === true){
                        input.toggleClass('blink');
                    }
                }, settings.caret_blink);
            }

            // Register native commands and responses
            if(settings.native_cmds){
                _public.native_commands();    
            }
            _public.native_responses(cmd_opts);

            // Quiet!
            var quiet = null;

            /* Command logic */
            var cmd_start = function(direct_cmd){

             //   loading.addClass('working');

                var cmd;
                if(typeof direct_cmd !== 'undefined'){
                    cmd = direct_cmd;
                }else{
                    cmd = input.text();    
                }

                tab_comp = settings.autocomplete;
                save_to_history = settings.history_max;

                // Option overrides
                cmd_opts.last = cmd;
                if(typeof cmd_opts.next == 'string'){
                    cmd = cmd_opts.next.replace(/%cmd%/i, cmd);
                    cmd_opts.next = null;
                    save_to_history = 0;
                }

                if(!cmd || cmd == ''){
                    return cmd_update();
                }else{
                    cmd_name = cmd.split( /\s+/ )[0];
                }

                if( typeof commands[cmd_name] !== 'undefined'){
                    cmd_obj = _public.tokenize(cmd, commands[cmd_name].options);
                }else{

                    //execute arbitrary commands
                    if(settings.allowArbitrary) {
                        add_to_history(cmd)
                        return settings.passCommand(cmd_obj.last).then(result => {
                                cmd_obj.out = result
                                return cmd_update()
                        }).catch(error => {
                            cmd_obj.out = error
                            return cmd_update()
                    })
                    } else {

                        if(!quiet){
                            cmd_opts.out = cmd_name+' : '+settings.i18n.error_not_found;    
                        }
                        return cmd_update();
                    }
                }

                // Run this before every *valid* command
                if(typeof settings.before_cmd == 'function') {
                    cmd_obj = cmd_response(settings.before_cmd(cmd_obj));
                    if(!cmd_obj){
                        return cmd_update();
                    }
                }

                // Run callbefores for current command if any
                if(typeof callbefores[cmd_name] == 'function'){
                    cmd_obj = cmd_response(callbefores[cmd_name](cmd_obj));
                    if(!cmd_obj){
                        return cmd_update();
                    }
                }

                // To modify history use a callbefore.
                if(!quiet){
                    add_to_history(cmd_opts.last);    
                }
                

                // Call command
                if( typeof commands[cmd_name].exe === 'function' ) {

                    cmd_response(commands[cmd_name].exe(cmd_obj));
                    return cmd_update();

                }else if( typeof commands[cmd_name].exe === 'string' ){

                    // Setup the defaults
                    var ajax_defaults = {}
                    if(!settings.ajax_options.data){
                        var ajax_data = {};
                        ajax_data[settings.param] = (cmd_opts.in !== null) ? cmd_opts.in : cmd_name;
                        ajax_data[settings.param+'_data'] = (cmd_opts.data !== null) ? cmd_opts.data : cmd_obj;
                        ajax_defaults.data = ajax_data;
                    }
                    
                    // Merge defaults with settings
                    var ajax_opts = $.extend(true, ajax_defaults, settings.ajax_options);
                    if(commands[cmd_name].exe){
                        ajax_opts.url = commands[cmd_name].exe;
                    }

                    // Do it.
                    var jqxhr = $.ajax(ajax_opts);
                    jqxhr.done(function( data ){
                        cmd_obj = cmd_response(data);
                    });
                    
                    jqxhr.fail(function(){
                        cmd_opts.out = settings.i18n.error_ajax;
                    });

                    jqxhr.always(function(){
                        return cmd_update();
                    });

                }else{
                    cmd_opts.out = settings.i18n.error_bad_method;
                    return cmd_update();
                }
            }

            var cmd_response = function(cmd_obj){
                if(typeof cmd_obj === 'object'){
                    // add cmd_obj to cmd_opts
                    for(var res in cmd_obj){
                        if(responses.hasOwnProperty(res)){
                            $.extend(true, cmd_opts, responses[res](cmd_obj));
                        }
                    }
                }
                return cmd_obj;
            }

            var cmd_callback = function(){
                if(cmd_obj){

                    // run callback if any
                    if(callbacks.hasOwnProperty(cmd_name)){
                        cmd_response(callbacks[cmd_name](cmd_obj));
                    }

                    // Run this after every command
                    if (typeof settings.after_cmd == 'function') {
                        cmd_response(settings.after_cmd(cmd_obj));
                    }
                }
            }

            var cmd_update = function(){
                // switches to original settings
                tab_comp = settings.autocomplete;
                save_to_history = settings.history_max;

                var cmd_ps   = (!cmd_opts.ps)   ? settings.ps : cmd_opts.ps;
                var cmd_out  = (!cmd_opts.out)  ? '' : cmd_opts.out;
                var cmd_in   = (!cmd_opts.in)   ? '' : cmd_opts.in;
                var cmd_last = (!cmd_opts.last) ? '' : cmd_opts.last;
                var cmd_next = (!cmd_opts.next) ? null : cmd_opts.next;

                if(!quiet){
                    // output
                    content.append(
                        '<div>'+
                            '<div class="cmd_in"><span class="cmd_ps">'+input.attr('data-ps')+'</span>'+cmd_last+'</div>'+
                            '<div class="cmd_out">'+cmd_out+'</div>'+
                        '</div>'
                    );
                }else{
                    content.append('<div><div class="cmd_out">'+cmd_out+'</div></div>');
                }

                cmd_callback();

                // input
                input.attr('data-caret', settings.caret)
                    .attr('data-ps', cmd_ps).text(cmd_in);
                if(settings.caret_blink === 0){
                    input.removeClass('blink');
                }
                if(input.hasClass('show-caret')){
                    // hide "real" caret if showing
                    input.removeClass('show-caret');
                }

                // Check if theme has changed.
                if(!el.hasClass(settings.theme)){
                    el.removeClass(el.attr('data-theme'))
                        .addClass(settings.theme)
                        .attr('data-theme', settings.theme);
                }

                // Reset options and save cmd_next
                if(cmd_next){
                    tab_comp = false;
                    save_to_history = 0;
                }
                quiet = null;

                cmd_opts = { 
                    ps : null, in : null, out : null,
                    last : null, next : cmd_next, data : null
                };

                cmd_obj = cmd_opts;

                cmd_end();
            }

            var cmd_end = function(){
                scroll_to_bottom();
                caret_to_end();
                loading.removeClass('working');
            }

            /* Helper functions: */

            // Add to history
            var add_to_history = function(str) {
                const isProper = typeof commands[cmd_name] !== 'undefined' 
                && str !== '' 
                && save_to_history > 0
                if( isProper || options.allowArbitrary) {

                    if( history.length > settings.history_entries ){
                        history.shift();
                    }
                    history.push( $.trim(str) );
                }
                // Reset history position
                hcurrent = 0;
            }

            /**
            * @method   : scroll_to_bottom
            * @desc     : I give up. Done is better than perfect.
            **/
            var scroll_to_bottom = function(){
                el.scrollTop(el.height() + 100000000000000000);    
            };

            // Set caret to end of input
            var caret_to_end = function () {
                input.focus();
                blinking = true;
                if (typeof window.getSelection != "undefined"
                        && typeof document.createRange != "undefined") {
                    var range = document.createRange();
                    range.selectNodeContents(input.get(0));
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else if (typeof document.body.createTextRange != "undefined") {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(input.get(0));
                    textRange.collapse(false);
                    textRange.select();
                }
            }

            var tab_completion = function(current_value) {
                var cmds = [ ];   
                if( current_value.match( /^[^\s]{0,}$/ ) ) {
                    for(var i in commands ) {
                        if( current_value == '' ) {
                            cmds.push( i );
                        } else if( i.indexOf( current_value ) == 0 ) {
                            cmds.push( i );
                        }
                    }

                    if( cmds.length > 1 ) {
                        cmd_opts.out = '<ul><li>'+cmds.join( '</li><li>' )+'</li></ul>';
                        cmd_opts.in = current_value;
                        cmd_update();
                    } else if( cmds.length == 1 ) {
                        input.text(cmds.pop() + ' ');
                    }
                }
            }

            /**
            * @method   : Anonymous
            * @desc     : Add event handlers to the input field
            * @event_handler
            **/
            input.keydown( function( e ) {
                var keycode = e.keyCode;
                switch( keycode ) {
                    // Command Completion Tab
                    case 9:
                        e.preventDefault();
                        if(tab_comp) {
                            tab_completion($.trim( input.text() ));
                            cmd_end();
                        }
                        break;

                    // Left and right arrows
                    case 37:
                    case 39:
                        if(settings.caret_blink > 0){
                            blinking = false;
                            // Add real caret
                            input.addClass('blink show-caret');
                        }
                        break;

                    // History Up
                    case 38:
                        e.preventDefault();
                        if(save_to_history > 0){
                            hcurrent = ( hcurrent === null || hcurrent == 0 ) ? history.length - 1 : hcurrent - 1;
                            input.text(history[ hcurrent ]);
                            cmd_end();
                        }
                        break;

                    // History Down
                    case 40:
                        e.preventDefault();
                        if(save_to_history > 0){
                            if( hcurrent === null || hcurrent == (history.length - 1 ) ){
                                input.html('');
                                break;
                            }
                            hcurrent++;
                            input.text(history[ hcurrent ]);
                            cmd_end();
                        }
                        break;

                    // Backspace and delete
                    case 46:
                    case 8:
                        // Funny glitch with <br>s being inserted
                        if(input.text().length === 1 || window.getSelection().toString() == input.text()){
                            input.html('');
                        }
                        break;
                    
                    // On Enter
                    case 13:
                        e.preventDefault();
                        document.execCommand('insertHTML', false, '');
                        cmd_start(); // important!
                        break;
                    // Escape key
                    case 27:
                        cmd_opts = {
                            ps : null, in : null, out : null,
                            last : null, next : null, data : null
                        };
                        input.text('');
                        cmd_start();
                        break;
                        
                }
            });
        });
        
        return _public;
    }

})(jQuery);