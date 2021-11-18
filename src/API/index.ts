import axios, { AxiosInstance, Method, AxiosResponse, AxiosRequestConfig } from 'axios';
import Sys from './system';
import Member from './member';
import Group from './group';

export default class PKAPI {

    ROUTES = {
        GET_SYSTEM: (sid?: string) => sid ? `/systems/${sid}` : `/systems/@me`,
        GET_MEMBER_LIST: (sid?: string) => sid ? `/systems/${sid}/members` : `/systems/@me/members`,
        GET_MEMBER: (mid: string) => `/members/${mid}`,
        GET_GROUP_LIST: (sid?: string) => sid ? `/systems/${sid}/groups` : `/systems/@me/groups`
    }

    baseUrl: string;
    instance: AxiosInstance
    
    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || 'https://api.pluralkit.me';

        this.instance = axios.create({
            baseURL: this.baseUrl + '/v2'
        })
    }

    async getSystem(options: { token?: string, id?: any}) {
        if (!options.token && !options.id) {
            throw new Error("Must pass a token or id.")
        }
        var system: Sys;
        var res: AxiosResponse;
        try {
            res = await this.handle(this.ROUTES.GET_SYSTEM(options.id ? options.id : ""), 'GET', {token: !options.id ? options.token : ""});
            if (res.status === 200) system = new Sys(res.data);
            else if (res.status === 500) throw new Error("Internal server error.");
            else {
                let errorObject: any = res.data
                if (typeof errorObject.message === "string") throw new Error(errorObject.message);
            }
        } catch (error) {
            throw new Error(error.message);
        }
        return system;
    }

    async getMemberList(options: { token?: string, id?: any}) {
        if (!options.token && !options.id) {
            throw new Error("Must pass a token or id.")
        }
        var members: Member[] = [];
        var res: AxiosResponse;
        try {
            res = await this.handle(this.ROUTES.GET_MEMBER_LIST(options.id ? options.id : ""), 'GET', {token: !options.id ? options.token : ""});
            if (res.status === 200) {
                let resObject: any = res.data;
                resObject.forEach(m => {
                    let member = new Member(m);
                    members.push(member);
                })
            }
            else if (res.status === 500) throw new Error("Internal server error.");
            else {
                let errorObject: any = res.data
                if (typeof errorObject.message === "string") throw new Error(errorObject.message);
            }
        } catch (error) {
            throw new Error(error.message);
        }
        return members;
    }

    async getMember(options: {id: any}) {
        if (!options.id) {
            throw new Error("Must pass an id.")
        }
        var member: Member;
        var res: AxiosResponse;
        try {
            res = await this.handle(this.ROUTES.GET_MEMBER(options.id), 'GET', {});
            if (res.status === 200) member = new Member(res.data);
            else if (res.status === 500) throw new Error("Internal server error.");
            else {
                let errorObject: any = res.data
                if (typeof errorObject.message === "string") throw new Error(errorObject.message);
            }
        } catch (error) {
            throw new Error(error.message);
        }
        return member;
    }

    async getGroupList(options: {token?: string, id?: any}) {
        if (!options.token && !options.id) {
            throw new Error("Must pass a token or id.");
        }
        var groups: Group[] = [];
        var res: AxiosResponse;
        try {
            res = await this.handle(this.ROUTES.GET_GROUP_LIST(options.id ? options.id : ""), 'GET', {token: !options.id ? options.token : ""});
                if (res.status === 200) {
                    let resObject: any = res.data;
                    resObject.forEach(g => {
                        let group = new Group(g);
                        groups.push(group);
                    })
                }
                else if (res.status === 500) throw new Error("Internal server error.");
                else {
                    let errorObject: any = res.data
                    if (typeof errorObject.message === "string") throw new Error(errorObject.message);
                }
        } catch (error) {
            throw new Error(error.message);
        }
        return groups;
    }

    async handle(url: string, method: Method, options: {token?: string, body?: object}) {
        var headers = {}
        var request: AxiosRequestConfig = {url, method, headers}

        if(options.token) request.headers["Authorization"] = options.token;
        if (options.body) {
            request.headers["Content-Type"] = "application/json";
            request.data = JSON.stringify(options.body);
        }

        try {
            var res = await this.instance(request);
        } catch (error) {
            res = error.response;
        }
        return res;
    }

}