/**
 * Author: Moses Adekunle Esan
 * Date: 8/3/16.
 * Project: React Native Authentication Views
 * Description: Login Data Model
 */

'use strict';

var React = require('react-native');
var {AsyncStorage} = React;

var {FBLogin, FBLoginManager} = require('react-native-facebook-login');



var LoginModel = {
    register: function(data, callback, type){
        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/register";

        if (type === "fb")
            url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/registerwithfb";

        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((responseData) => {

                if(type === "fb"){
                    if (responseData.error) callback(false, responseData.error)
                    else {
                        //2 - Save Token
                        AsyncStorage.setItem('token',responseData.token);
                        callback(true, null);
                    }
                }else{
                    if (responseData.success) callback(true, responseData.message, null)
                    else callback(false, null, responseData.error)
                }



            }).catch(error => {
                callback(false, null, error)
            })
            .done();
    },

    registerWithFacebook: function(callback){
        var _this = this;
        FBLoginManager.loginWithPermissions(["public_profile","email"], function(error, data){
            if (!error){
                var credentials = data.credentials;


                var api = `https://graph.facebook.com/v2.3/${credentials.userId}?fields=name,email&access_token=${credentials.token}`;

                fetch(api)
                    .then((response) => response.json())
                    .then((responseData) => {
                        var data =  {
                            name : responseData.name,
                            email: responseData.email,
                            fbToken: credentials.token,
                            fbID: credentials.userId
                        }
                        _this.register(data, callback, "fb");
                        //save the users info
                        //generate a token adn log user in
                    }).catch(error => {
                        alert("err1")
                        callback(null, error);
                    })
                    .done();


            }else{
                callback(data, error);
            }
        })
    },

    login: function(data, callback){
        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/login";
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData.error) callback(false, responseData.error)
                else {
                    //2 - Save Token
                    AsyncStorage.setItem('token',responseData.token);
                    callback(true, null);
                }
            }).catch(error => {
                callback(false, error)
            })
            .done();
    },

    sendVerification: function(email, phone, type, callback){
        var data = {"email" : email, "phone_number": phone, "v_type": type}
        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/verification";
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData.success) callback(true, responseData.message, null)
                else callback(false, null, responseData.error)
            }).catch(error => {
                callback(false, error)
            })
            .done();
    },

    verifyCode: function(code, callback){
        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/verify/sms/"+code;
        fetch(url).then((response) => response.json())
            .then((responseData) => {
                if (responseData.success) callback(true, responseData.message, null)
                else callback(false, null, responseData.error)
            }).catch(error => {
                callback(false, error)
            })
            .done();
    },

    recoverPassword: function(email, callback){
        var data = {"email" : email}
        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/recover";
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((responseData) => {
                if (responseData.success) callback(true, responseData.message, null)
                else callback(false, null, responseData.error)
            }).catch(error => {
                callback(false, null, error)
            })
            .done();
    },

    checkTokenExist(callback) {
        AsyncStorage.getItem('token', (err, token) => {
            if(token === null) callback(false, null);
            else callback(true, token)
        });
    },

    getSessionToken(callback) {
        AsyncStorage.getItem('token', (err, token) => {
            callback(err, token)
        });
    },

    logout(){
        AsyncStorage.removeItem('token'); //clear token on device
        //this.checkTokenExist(function(exist, token){
        //    if (exist){ //invalidate token
        //        var data = {"token" : token}
        //        var url ="http://ec2-54-153-72-254.us-west-1.compute.amazonaws.com/api/logout";
        //        fetch(url, {
        //            method: 'POST',
        //            headers: {
        //                'Accept': 'application/json',
        //                'Content-Type': 'application/json'
        //            },
        //            body: JSON.stringify(data)
        //        })
        //            .then((response) => response.json())
        //            .then((responseData) => {})
        //            .done();
        //    }
        //});
    },

}

module.exports = LoginModel;
