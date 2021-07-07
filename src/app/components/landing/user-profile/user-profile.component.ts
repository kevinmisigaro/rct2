import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FileManagerService } from 'src/app/services/file-manager.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileImage: File = null
  user;
  en: boolean = false
  languageSubsription: Subscription

  constructor(private auth: AuthService,private helper: HelperService, private fileService: FileManagerService, private toastr: ToastrService, private spinner: NgxSpinnerService) { 
    this.languageSubsription = this.helper.getLanguage().subscribe(language => { this.ngOnInit() })
  }

  ngOnDestroy():void{
    this.languageSubsription.unsubscribe()
  }

  ngOnInit(): void {
    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else {
      this.en = false
    }
    
    this.auth.userInformation().subscribe(res => {
      this.user = res.data
      console.log(this.user)
    })
  }

  onFileChanged(event) {
    this.profileImage = event.target.files[0]

    this.spinner.show()

    let formData = new FormData()
    formData.append('file', this.profileImage, this.profileImage.name)

    if(this.user.profile_image_path != "" || null){
      this.fileService.deleteFileByReferenceId(localStorage.getItem('id')).subscribe(() => {
        this.fileService.uploadFile('dp', localStorage.getItem('id'), formData).subscribe(() => {
          this.spinner.hide()
          this.profileImage = null
          this.ngOnInit()
        })
      })
    } else {
      this.fileService.uploadFile('dp', localStorage.getItem('id'), formData).subscribe(() => {
        this.spinner.hide()
        this.profileImage = null
        this.ngOnInit()
      })
    }

  }

  getJPGextension(data: string){
    console.log(data)
    var field = data.split('.')
    var newField = field[0].concat('.jpg')
    // return newField
    return data
  }


}
