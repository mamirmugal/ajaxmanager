
var baseurl = "http://localhost/my/ajaxmanger/";
    
/**
 * Extend method to extend the child with parent properties
 */
function extend(Child, Parent){
    Child.prototype = Parent.prototype;
    Child.prototype.constructor = Child;
    Child.base = Parent.prototype;
}

/**
 * Custom Exception
 */
function customException(value) {
    
    /**
     * Pointing to this class
     */
    var self = this;
    if(typeof value != "undefined")
        self.value = value;
    else
        self.value = null;

    self.message = "Error";
    
    /**
     * Public method to get Error Message
     */
    self.toString = function toString() {
        //return this.value + this.message;
        return this.value;
    };
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * ajax class
 * 
 * myajax.ajax({
            show_val : false,
            url :'',
            data: {},
            success: {
                error : {
                    msg : '',
                    callback: function(){}
                },
                before:function(){},
                success:{
                    msg : '',
                    callback: function(obj){}
                }
            }
        });
 * 
 */
var AjaxManager = function AjaxManager(){
    /**
     * Global value to test ajax return value in console
     * @author Amir M
     */
    testval = null;
}

AjaxManager.prototype = {
    
    /**
     * Default value of the Ajax called to be made 
     * in All ajax call funtioncs
     * @author Amir M 
     */    
    setvalue : 0,
    
    /**
     * getting all the private method
     * @author Amir M
     * @param obj       This class object
     * @return all      method with starts with "init" in an array
     */
    getKeys : function getKeys(obj){
        var keys = [];
        for(var key in obj){
            if(key.search("init") != -1 && key != "init"){
                // calling all the init methods
                obj[key]();
                keys.push(key);
            }
        }
        return keys;
    },
    
    /**
     * Local console log
     * @authro Amir M
     */
    log : function log(str){
        console.log(str);
    },
    
    /**
     * Randam value generator
     */
    makeRandom : function makeRandom(){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 10; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },
    
    /**
     * load when the object is created
     */
    init : function init(obj){
        // loading all the init methods
        this.getKeys(this);
        
        /**
         * Checking the wizard if it is not assinged to someone 
         * and take the your to specific page 
         * other wise it will the redirect to home page
         */
        this.callEnd(obj);
    },
    
    /**
     * Call a single method or array of method
     * @author Amir M
     */
    callEnd : function callEnd(obj){
        
        // calling collection of objects
        if(obj instanceof Array){
            this.ajaxQueue({
                before: [],
                queue: obj,
                after: []
            });
        }
        
        // calling if itelf is a function
        if(obj instanceof Function){
            obj();
        }
        
    },
    
    /**
     * This will call all ajax query at a time and with one loader
     * @param obj       Array of Reference to the function to be called 
     */
    ajaxQueue : function ajaxQueue(obj){
        
        if(typeof obj != "" && typeof obj == "object"){
            var i,j = null;
            
            if(typeof obj.before != "" && typeof obj.before == "object"){
                for(i in obj.before){
                    obj.before[i]();
                }
            }
            
            if(typeof obj.queue != "" && typeof obj.queue == "object"){
                var vall = true;
                for(j in obj.queue){
                    obj.queue[j].val = vall;
                    obj.queue[j]();
                }
            }
            
            if(typeof obj.after != "" && typeof obj.after == "object"){
                for(j in obj.after){
                    obj.after[j]();
                }
            }
            
        }
        
    },
    
    /**
     * Custom ajax call 
     * @param obj       will have all the values required for ajax call
     */
    ajax : function ajax(obj){
        
        var $this = this;
        
        var callerCheck = false;
        
        /**
         * this will get the parent val value from there
         * this will be used only when queue is called
         */
        if(typeof arguments.callee.caller.val != "undefined"){
            callerCheck = true;
        }
        
        // this is the name of the caller function
        var callerName =  arguments.callee.caller.name;
        
        if(callerName == "")
            callerName = $this.makeRandom();
        
        var loader_text = 'Please Wait';
        if(typeof obj.loader_text != "undefined" && obj.loader_text != ""){
            loader_text = obj.loader_text;
        }
        
        var success_call = function(){};
        var error_call = function(){};
        var error_show = false;
        var loader_show = true;
        
        if(typeof obj.show_loader != 'undefined')
            loader_show = obj.show_loader;
        
        if(typeof obj.show_val == "undefined"){
            error_show = false;
        }
        else{
            error_show = obj.show_val;
        }
        
        // check ajax url
        if(typeof obj.url == "undefined"){
            $this.log("Ajax url is required for ajax call!");
        }
        // check ajax data
        else if(typeof obj.data == "undefined"){
            $this.log("Ajax Data is required for ajax call!");
        }
        else if(typeof obj.success == "undefined"){
            $this.log("Ajax success object is required for ajax call!");
        }
        else if(typeof obj.success == "object"){
            
            if(typeof obj.success.success == "undefined"){
                $this.log("Ajax Success Object's success object is required for ajax call!");
            }else{
                if(typeof obj.success.success.callback == "undefined"){
                    $this.log("Ajax Success Object's success callback function is required for ajax call!");
                }
                else{
                
                    if(typeof obj.success.error.callback == "undefined"){
                        obj.success.error.callback = function(){};
                    }
                
                    if(typeof obj.type == "undefined"){
                        obj.type = "POST";
                    }
                    
                    /**
                     * load the one loader for collection of ajax call
                     * when the setvalue is 0 and when the value send by
                     * caller is true
                     */
                    if($this.setvalue == 0 && callerCheck == true && loader_show == true){
                        $this.loading_loader(loader_text, 'main_call');
                    }
                    
                    /**
                     * will work only when there is collective ajax call
                     */
                    if(callerCheck == true){
                        $this.setvalue++;
                    //$this.log(" + " + $this.setvalue);
                    }
                    else if(loader_show == true){
                        $this.loading_loader(loader_text, callerName);
                    }
                    
                    jQuery.ajax({
                        url: baseurl + obj.url,
                        type: obj.type,
                        data: obj.data,
                        success: function(data) {
                        
                            if(error_show == true)
                                $this.log(obj);
                            
                            // called when the ajax data is just recieved
                            if(typeof obj.success.before != 'undefined' && typeof obj.success.before == 'function'){
                                obj.success.before();
                            }
                            
                            try {
                                var obj_ret = jQuery.parseJSON(data);
                                
                                /**
                                 * error send by json and if it is not empty
                                 * if the error is empty then it will show the error send by json
                                 * and if the error is not send by json then it will show the error
                                 * set in the ajax setup
                                 */
                                if(typeof obj_ret.error != 'undefined' && obj_ret.error != ""){
                                    
                                    if(error_show == true)
                                        $this.log('error');
                                    
                                    // calling if the error callback function is set and there is an error
                                    if(typeof obj.success.error.callback != 'undefined' && typeof obj.success.error.callback == 'function'){
                                        
                                        if(error_show == true){
                                            $this.log('error callback function');
                                            $this.log(obj.success.error.callback);
                                        }
                                        
                                        error_call = obj.success.error.callback;
                                    }
                                    
                                    /**
                                     * this will getting up the call back method redirect
                                     */
                                    if(typeof obj_ret.error.redirect != 'undefined' && obj_ret.error.redirect != ""){
                                        error_call = function(){
                                            setTimeout(function(){
                                                document.location = baseurl + obj_ret.error.redirect;
                                            },100);
                                        }
                                    }
                                    
                                    // if the error send by json msg is set and not equal to empty
                                    if(typeof obj_ret.error.msg != 'undefined' && obj_ret.error.msg != ""){
                                        
                                        if(error_show == true)
                                            $this.log('error by json');
                                        
                                        $this.generateNoty(obj_ret.error.msg, 'error');
                                        error_call(obj.success.error);
                                    }
                                    else{
                                        // if 
                                        if(typeof obj.success.error.msg != 'undefined' && obj.success.error.msg != ""){
                                            
                                            if(error_show == true)
                                                $this.log('error by user');
                                            
                                            $this.generateNoty(obj.success.error.msg, 'error');
                                            error_call(obj.success.error);
                                        }
                                    }
                                }
                            
                                /**
                                 * this will be send my the json and it will show the success message send my json
                                 * and if json success is not set then it will show the success msg set in ajax call
                                 * and if callback function is called where there is a success msg
                                 */
                                if(typeof obj_ret.success != 'undefined'){
                                    
                                    if(error_show == true)
                                        $this.log('success');
                                    
                                    // if the callback is SET and is a function 
                                    if(typeof obj.success.success.callback != 'undefined' && typeof obj.success.success.callback == 'function'){
                                        
                                        if(error_show == true){
                                            $this.log('success call method');
                                            $this.log(obj.success.success.callback);
                                        }
                                        
                                        success_call = obj.success.success.callback;
                                    }
                                    
                                    // if the return json SUCCESS MSG is set and not empty
                                    if(typeof obj_ret.success.msg != 'undefined' && obj_ret.success.msg != ""){
                                        
                                        if(error_show == true)
                                            $this.log('success msg by user');
                                        
                                        $this.generateNoty(obj_ret.success.msg, 'success');
                                        //success_call(obj.success.success);
                                        success_call(obj_ret.success);
                                    }
                                    else{
                                        if(error_show == true)
                                            $this.log('success else');
                                        
                                        // if js SUCCESS MSG is set and not empty
                                        if(typeof obj.success.success.msg != 'undefined' && obj.success.success.msg != ""){
                                            
                                            if(error_show == true)
                                                $this.log('success msg by json');
                                            
                                            $this.generateNoty(obj.success.success.msg, 'success');
                                            //success_call(obj.success.success);
                                            success_call(obj_ret.success);
                                        }
                                        
                                        // if return SUCCESS MSG is not set or it is emtpy
                                        if(typeof obj_ret.success.msg == 'undefined' || obj_ret.success.msg == ""){
                                            
                                            if(error_show == true)
                                                $this.log('success else call');
                                            
                                            success_call(obj_ret.success);
                                        }
                                    }
                                }
                                
                            }
                            catch (e) {
                                $this.log(data)
                                $this.generateNoty('Something went wrong, Please try agin in few minutes!', 'error');
                            }
                            
                            /**
                             * callerCheck is send by the queue function for showing only one loader 
                             * and decrease the total count of ajax called made and 
                             * deactivating the custom value once the ajax call is finished
                             * and show close loader when all the ajax call are finished
                             */
                            if(callerCheck == true){
                                //$this.log(" - " + $this.setvalue + " "+ obj.url);
                                $this.setvalue--;
                                arguments.callee.caller.val = false;
                                if($this.setvalue == 0){
                                    unloading_loader('main_call');
                                }
                            }
                            // close single loader when the single ajax call is finsishded
                            else if(loader_show == true){
                                unloading_loader(callerName);
                            }
                            
                            // calling the method which will be called after the ajax obj is recieved
                            if(typeof obj.success.after != 'undefined' && typeof obj.success.after == 'function'){
                                obj.success.after();
                            }
                            
                        }
                    })
                
                }
            }
        }
        else{
            this.log("Ajax success is not an object!");
        }
    },
    
    /**
     * This will show the alert or custom notification plugin
     * @param msg String to show in alert
     * @param type Type of alert
     */
    generateNoty : function(msg, type){
        alert(msg);
    }
    
    
};

/**
 * loading_loader() 	Loading loader
 * @param  {Stirng} 	name    
 * @param  {integer} 	overlay_name 
 * @return null
 */
function loading_loader(name, overlay_name) {
    
    var overlay = "";
    if(typeof overlay_name == 'undefined'){
        overlay = "over";
    }
    else{
        overlay = overlay_name;
    }
    var preloader = overlay + "preloader";
    
    if($('.'+overlay).length == 0){
        
        var div = '<div class="overlay '+preloader+'" style="z-index:99991;"></div>'+
        '<div class="box '+overlay+'" id="ajax_loader" style="z-index:99992;">'+
        '<div class="wrap"><h4>'+name+'...</h4></div>'+
        '</div>';

        $('body').append(div);
        setTimeout(function(){
            $('.overlay').height( $(document).height() )
            $('.'+overlay).addClass('active')
        },300)
    }
}

/**
 * unloading_loader() Removeing loader
 * @return null
 */
function unloading_loader(overlay_name) {

    var overlay = "";
    if(typeof overlay_name == 'undefined'){
        overlay = "over";
    }
    else{
        overlay = overlay_name;
    }
    var preloader = overlay + "preloader";
    
    setTimeout(function(){
        $('.'+overlay).removeClass('active').remove();
        $('.'+preloader).removeClass('active').remove();
    },30)

}

AjaxManager.prototype.loading_loader = loading_loader;
AjaxManager.prototype.unloading_loader = unloading_loader;


/**
 * This is the local method for the ajax manager
 */
var myajax = new AjaxManager();