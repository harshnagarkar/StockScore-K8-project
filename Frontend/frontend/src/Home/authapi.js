import React from 'react';
import axios from 'axios';

export const login=async (email,password,callback)=>{
    await axios.post(`http://35.238.192.112/auth/login`,{"email":email,"password":password})
      .then(res => {
        if(res.status==200){
          callback(true,null)
        }else{
          callback(false,res.status)
        }
      }).catch(res=>{
          callback(false,res)
      })

}


export const createAccount=async(email,password,callback)=>{
  await axios.post(`http://35.238.192.112/auth/createAccount`,{"email":email,"password":password})
    .then(res => {
      if(res.status==200){
        callback(true,null)
      }else{
        callback(false,res.status)
      }
    }).catch(res=>{
        callback(false,res)
    })

}


export const refresh=(callback)=>{
  axios.get(`http://35.238.192.112/auth/refresh`)
    .then(res => {
      if(res.status==200){
        callback(true,null)
      }else{
        callback(false,res)
      }
    }).catch(res=>{
        callback(false,res)
    })

}

export const logout=async(callback)=>{
  await axios.get(`http://35.238.192.112/auth/logout`)
    .then(res => {
      if(res.status==200){
        callback(true,null)
      }else{
        callback(false,res.status)
      }
    }).catch(res=>{
        callback(false,res)
    })

}
