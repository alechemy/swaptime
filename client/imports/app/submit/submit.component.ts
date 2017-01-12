import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from "rxjs";
import { Meteor } from 'meteor/meteor';

import { CourseService } from '../course/course.service';
import { Listing } from "../../../../both/models/listing.model";
import { ListingsCollection } from "../../../../both/collections/listings.collection";
import { Spring2017 } from '../../../../both/collections/spring2017.collection';

import { Departments } from './departments.model';
import { Days } from './days.model';
import { Times } from './times.model';
import { SelectItem } from 'primeng/primeng';

import template from './submit.component.html';

@Component({
  selector: 'app-submit',
  template,
  styleUrls: ['./submit.component.scss']
})

export class SubmitComponent implements OnInit {
  private courses: any; //bad...
  private course: any;
  private filteredCourses: any;
  private departments: SelectItem[] = new Departments().departments;
  private times: SelectItem[] = new Times().times;
  private days: Days = new Days();
  private addForm: FormGroup;
  private dataAvailable: boolean = false;
  private errorMessage: string;

  constructor(private courseService: CourseService,
              private router: Router,
              private formBuilder: FormBuilder,
              private ngZone: NgZone) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      department: ['', Validators.required],
      courseNumber: ['', Validators.required],
      days: ['', Validators.required],
      time: ['', Validators.required],
      fullTitle: ['', Validators.required],
      type: ['', Validators.required],
      section: '',
      description: ''
    });
    this.getCourses();
  }

  getCourses(): void {
    Meteor.call('getCourses', (err, result) => this.ngZone.run(() => {
      if (err) {
        this.errorMessage = "You need to be logged in to access the Spring 2017 courses database.";
        console.error('error', err);
      } else {
        this.courses = result;
        this.dataAvailable = true;
      }
    }));
  }

  filterCourses(event) {
    this.filteredCourses = [];
    for (let i = 0; i < this.courses.length; i++) {
      let c = this.courses[i];

      if (c.title.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
        if (c.section != "0") {
          c.sectionTitle = c.title + " (" + c.section + ")";
          c.listingSection = c.section;
        } else {
          c.sectionTitle = c.title;
          c.listingSection = '';
        }
        this.filteredCourses.push(c);
      }
    }
  }

  handleSelect(value) {
    this.addForm.setValue({department: value.subj,
                           courseNumber: value.cnum,
                           days: value.days,
                           time: value.time,
                           fullTitle: value.title,
                           section: value.listingSection,
                           type: '',
                           description: ''
                         });
  }

  submitListing(): void {
    if (!Meteor.userId()) {
      alert('You must be logged in to submit a new listing.');
      return;
    }

    if (this.addForm.valid) {
      this.courseService.submitToDB(this.addForm.value, Meteor.userId(), Meteor.user().profile.displayname);
      this.addForm.reset();
      let link = ['/listings'];
      this.router.navigate(link);
    }
  }

}