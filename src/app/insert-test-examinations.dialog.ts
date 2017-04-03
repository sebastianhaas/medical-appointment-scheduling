import { Component, OnInit } from '@angular/core';
import { MdDialogRef }       from '@angular/material';

@Component({
  selector: 'insert-test-examinations-dialog',
  template: `
    <h1 i18n md-dialog-title>Insert test examinations</h1>
    <div md-dialog-content>
      <md-select #examinationSelect
        i18n-placeholder
        placeholder="Examination group"
        required="true">
        <md-option *ngFor="let group of examinationGroups" [value]="group.sectionNumber">
          {{ group.title }}
        </md-option>
      </md-select>
    </div>
    <div md-dialog-actions>
      <button i18n md-button (click)="dialogRef.close()">CANCEL</button>
      <button i18n md-button [disabled]="!examinationSelect.selected"
        (click)="dialogRef.close({
          sectionNumber: examinationSelect.selected.value,
          sectionTitle: examinationSelect.selected.viewValue
        })"
      >OK</button>
    </div>
  `,
  styles: [`
    .mat-select {
      width: 300px;
      margin-top: 24px;
      margin-bottom: 24px;
    }
    /deep/ .mat-select-panel { max-width: unset !important; }
    h1 { font-family: "Roboto"; }
  `]
})
export class InsertTestExaminationsDialogComponent implements OnInit {

  public examinationGroups = [];

  private examinationGroupsEn = [
    {
      sectionNumber: '0',
      title: 'Procedures And Interventions, Not Elsewhere Classified'
    },
    {
      sectionNumber: '1',
      title: 'Operations On The Nervous System'
    },
    {
      sectionNumber: '2',
      title: 'Operations On The Endocrine System'
    },
    {
      sectionNumber: '3',
      title: 'Operations On The Eye'
    },
    {
      sectionNumber: '3A',
      title: 'Other Miscellaneous Diagnostic And Therapeutic Procedures'
    },
    {
      sectionNumber: '4',
      title: 'Operations On The Ear'
    },
    {
      sectionNumber: '5',
      title: 'Operations On The Nose, Mouth, And Pharynx'
    },
    {
      sectionNumber: '6',
      title: 'Operations On The Respiratory System'
    },
    {
      sectionNumber: '7',
      title: 'Operations On The Cardiovascular System'
    },
    {
      sectionNumber: '8',
      title: 'Operations On The Hemic And Lymphatic System'
    },
    {
      sectionNumber: '9',
      title: 'Operations On The Digestive System'
    },
    {
      sectionNumber: '10',
      title: 'Operations On The Urinary System'
    },
    {
      sectionNumber: '11',
      title: 'Operations On The Male Genital Organs'
    },
    {
      sectionNumber: '12',
      title: 'Operations On The Female Genital Organs'
    },
    {
      sectionNumber: '13',
      title: 'Obstetrical Procedures'
    },
    {
      sectionNumber: '14',
      title: 'Operations On The Musculoskeletal System'
    },
    {
      sectionNumber: '15',
      title: 'Operations On The Integumentary System'
    },
    {
      sectionNumber: '16',
      title: 'Miscellaneous Diagnostic And Therapeutic Procedures'
    }
  ];

  private examinationGroupsDe = [
    {
      sectionNumber: '0',
      title: 'Nicht anderweitig klassifizierte Behandlungen'
    },
    {
      sectionNumber: '1',
      title: 'Behandlungen am Nervensystem'
    },
    {
      sectionNumber: '2',
      title: 'Behandlungen am endokrinen System'
    },
    {
      sectionNumber: '3',
      title: 'Behandlungen am Auge'
    },
    {
      sectionNumber: '3A',
      title: 'Andere diagnostische und therapeuthische Prozeduren'
    },
    {
      sectionNumber: '4',
      title: 'Behandlungen am Ohr'
    },
    {
      sectionNumber: '5',
      title: 'Behandlungen an Nase, Mund und Pharynx'
    },
    {
      sectionNumber: '6',
      title: 'Behandlungen am Atemtrakt'
    },
    {
      sectionNumber: '7',
      title: 'Behandlungen am kardiovaskulären System'
    },
    {
      sectionNumber: '8',
      title: 'Behandlungen am hämatologischen und lymphatischen System'
    },
    {
      sectionNumber: '9',
      title: 'Behandlungen am Verdauungstrakt'
    },
    {
      sectionNumber: '10',
      title: 'Behandlungen an den Harnwegen'
    },
    {
      sectionNumber: '11',
      title: 'Behandlungen am männlichen Genitaltrakt'
    },
    {
      sectionNumber: '12',
      title: 'Behandlungen am weiblichen Genitaltrakt'
    },
    {
      sectionNumber: '13',
      title: 'Geburtshilfe'
    },
    {
      sectionNumber: '14',
      title: 'Behandlungen am Bewegungsapparat'
    },
    {
      sectionNumber: '15',
      title: 'Behandlungen der Haut'
    },
    {
      sectionNumber: '16',
      title: 'Verschiedene diagnostische und therapeuthische Prozeduren'
    }
  ];

  constructor(public dialogRef: MdDialogRef<InsertTestExaminationsDialogComponent>) {}

  public ngOnInit() {
    this.examinationGroups = localStorage.getItem('locale').startsWith('de') ?
      this.examinationGroupsDe :
      this.examinationGroupsEn;
  }
}
