import axios, { AxiosInstance, Method, AxiosResponse, AxiosRequestConfig } from 'axios';
import Sys from './system';

export default class PKAPI {

    ROUTES = {
        GET_SYSTEM: (sid?: string) => sid ? `/systems/${sid}` : `/systems/@me`
    }

    baseUrl: string;
    instance: AxiosInstance
    
    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || 'https://api.pluralkit.me';

        this.instance = axios.create({
            baseURL: this.baseUrl + '/v2',
            validateStatus: function (status) {
                return status < 500;
            }
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