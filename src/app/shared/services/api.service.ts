import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { IOwnership, ISearchResponse, ITown, ITownResponse } from "../types/responses.types";

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {}
    url = environment.BackendUrl;
    getOwnwership() {
        let url = `${this.url}/ownerships`;
        return this.http.get<IOwnership>(url);
    }
    getType(){
        let url = `${this.url}/types`;
        return this.http.get<IOwnership>(url);
    }
    getTown(name: string){
        let url = this.url + "/search/town";
       const body = {
            name: name
        }
        return this.http.post<ITownResponse>(url, body);
    }
    searchHospitals(name: string){
        let url = this.url + "/search";
        const body = {
            name: name
        }
        return this.http.post<ISearchResponse>(url, body);
    }
}