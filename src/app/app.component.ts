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
import { ITown, ITownResponse } from './shared/types/responses.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule],
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
  filter = this.fb.group({
    ownership: ['', Validators.required],
    type: ['', Validators.required],
    town: ['', Validators.required],
  });
  hospital = this.fb.group({
    search: ['', Validators.required],
  });
  selectedTown!: string;
  constructor(private api: ApiService, private fb: NonNullableFormBuilder) {
    this.fetchOwnwership();
    this.fetchType();
    this.debounce();
  }
  ngOnInit() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      if (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let loader = new Loader({
          apiKey: environment.googleApiKey,
          version: "weekly",
  
        });

      loader.load().then(() => {
          new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: { lat, lng },
            zoom: 12,
            mapId: environment.googleMapId,
            mapTypeControl: false,
            fullscreenControl: false,

            streetViewControl: false,
           
          });
        });
      }
    }) 

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
          console.error('No town found');
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
    console.log(this.hospital.value.search);
  }
}
//api integration for search and filter
