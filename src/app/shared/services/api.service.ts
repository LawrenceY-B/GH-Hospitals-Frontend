import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Ownership } from "../types/responses.types";

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {}
    url = environment.BackendUrl;
    getOwnwership() {
        let url = `${this.url}/ownerships`;
        return this.http.get<Ownership>(url);
    }
}