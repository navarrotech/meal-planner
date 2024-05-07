// Copyright © 2023 Navarrotech

import axios, { type AxiosInstance } from 'axios';
import { apiUrl } from '@/env';

export let axiosAPI: AxiosInstance;

axiosAPI = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    validateStatus: () => true,
    responseType: "json"
});
// @ts-ignore
axiosAPI.defaults.crossDomain = true;

axiosAPI.get('/test').then(console.log)