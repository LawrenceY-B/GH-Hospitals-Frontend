import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../environments/environment';
import { ApiService } from './shared/services/api.service';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IFilter, ISearch, ITown, ITownResponse } from './shared/types/responses.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'GH-Hospitals-Frontend';
  latitude!: number;
  longitude!: number;
  search = false;
  ownwership!: string[];
  types!: string[];
  townList: string[] = [];
  selectedSearch!: string;
  selectedTown!: string;
  searchResults: ISearch[] = [];
  filteredResults: ISearch[] = [];
  filter = this.fb.group({
    ownership: ['', Validators.required],
    type: ['', Validators.required],
    town: ['', Validators.required],
  });
  hospital = this.fb.group({
    search: [''],
  });
  constructor(private api: ApiService, private fb: NonNullableFormBuilder) {
    this.fetchOwnwership();
    this.fetchType();
    this.debounce();
    this.debounceSearch();
  }
  ngOnInit() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      if (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let loader = new Loader({
          apiKey: environment.googleApiKey,
          version: 'weekly',
        });

        loader.load().then(() => {
          new google.maps.Map(document.getElementById('map') as HTMLElement, {
            center: { lat, lng },
            zoom: 12,
            mapId: environment.googleMapId,
            mapTypeControl: false,
            fullscreenControl: false,

            streetViewControl: false,
          });
        });
      }
    });
  }

  fetchOwnwership() {
    this.api.getOwnwership().subscribe({
      next: (data) => {
        this.ownwership = data.data;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }
  fetchType() {
    this.api.getType().subscribe({
      next: (data) => {
        this.types = data.data;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }
  fetchTown() {
    this.api.getTown(this.filter.get('town')!.value).subscribe({
      next: (data) => {
        this.townList = data.data;
      },
      error: (error) => {
        if (error.error.message === 'No Town found') {
          this.townList = [];
        } else {
          console.error('There was an error!', error);
        }
      },
    });
  }
  debounce() {
    this.filter
      .get('town')!
      .valueChanges.pipe(debounceTime(1500), distinctUntilChanged())
      .subscribe((value) => {
        if (this.selectedTown === value) {
          return;
        }
        this.fetchTown();
      });
  }
  select(town: string) {
    this.selectedTown = town;
    this.filter.get('town')!.setValue(town);
    this.townList = [];
  }
  displaySearch() {
    this.search = !this.search;
  }
  searchHospital() {
    const name = this.hospital.value.search as string;
    this.api.searchHospitals(name).subscribe({
      next: (response) => {
        console.log(response);
        this.searchResults = response.data;
        console.log(this.searchResults)
      },
      error: (error) => {
        if (error.error.message === 'No hospital found') {
          this.searchResults = [];
        }
        console.error('There was an error!', error);
      },
    });
  }
  debounceSearch() {
    this.hospital
      .get('search')!
      .valueChanges.pipe(debounceTime(1500), distinctUntilChanged())
      .subscribe((value) => {
        if (this.selectedSearch === value) {
          return;
        }
        this.searchHospital();
      });
  }
  selectSearch(hospital: string) {
    this.selectedSearch = hospital;
    this.hospital.get('search')!.setValue(hospital);
    this.searchResults = [];
  }
  filterHospital(){
    const data = this.filter.value;
    const param: IFilter ={
      ownership: data.ownership as string,
      type: data.type as string,
      town: data.town as string,
    }
    console.log(param)
    this.api.filterHospitals(param).subscribe({
      next: (response) => {
        this.filteredResults = response.data;
        console.table(this.filteredResults)
      },
      error: (error) => {
        if (error.error.message === 'No hospital found') {
          this.searchResults = [];
        }
        console.error('There was an error!', error);
      },
    });
   
  }
}

//api integration for search and filter
