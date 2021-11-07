import axios, { AxiosInstance, Method, AxiosResponse, AxiosRequestConfig } from 'axios';
import Sys from './system';
import Member from './member';

export default class PKAPI {

    ROUTES = {
        GET_SYSTEM: (sid?: string) => sid ? `/systems/${sid}` : `/systems/@me`,
        GET_MEMBER_LIST: (sid?: string) => sid ? `/systems/${sid}/members` : `/systems/@me/members`
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
            if (options.id) {
                    res = await this.handle(this.ROUTES.GET_SYSTEM(options.id), 'GET', {});
                    if (res.status === 200) system = new Sys(res.data);
                    else if (res.status === 404) throw new Error(`System with id ${options.id} not found.`);
                    else throw new Error(JSON.stringify(res.status) + ': ' + JSON.stringify(res.data));
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
            if (options.id) {
                    res = await this.handle(this.ROUTES.GET_MEMBER_LIST(options.id), 'GET', {});
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
            }
        } catch (error) {
            throw new Error(error.message);
        }
        return members;
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