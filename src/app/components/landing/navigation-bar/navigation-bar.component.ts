import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Role } from 'src/app/models/auth.model';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';
import { PriceService } from 'src/app/services/price.service';
import { SellerService } from 'src/app/services/seller.service';
import * as firebase from 'firebase'

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
})
export class NavigationBarComponent implements OnInit {
  signIn: boolean = true; //initial login page in modal
  createAccount: boolean = false; //displays name input for creating account
  isOTP: boolean = false; //OTP input page in modal
  isAuthed: boolean = false; //checks if user is authenticated
  chooseRole: boolean = false; //choose role page for users
  chooseRoleAdmin: boolean = false;
  selectedCountryCode = '+255';
  isStaff: boolean = false; //checks if user wants to login as staff
  countries = [];
  roles: Role[] = [];
  dialCode: string;
  phoneNumber: string;
  role;
  showProfile: boolean = false;
  priceRates = []
  en: boolean = false

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private helper: HelperService,
    private modal: NgbModal,
    private sellerService: SellerService,
    private priceRateService: PriceService,
  ) {}

  ngOnInit(): void {

    if(localStorage.getItem('lang') === 'en'){
      this.en = true
    } else{
      this.en = false
    }

    this.priceRateService.getPriceRate().subscribe(res => {
      this.priceRates = res.data
    })

    if (localStorage.getItem('access_token')) {
      this.isAuthed = true;
    }

    if(this.authService.loggedIn){
      this.showProfile = true
      console.log('profile ', this.showProfile)
      this.role = localStorage.getItem('role')
    }

    //helps toggle login modal
    this.helper.toggle$.subscribe((toggle) => {
      if (toggle) {

        console.log('value of toggle is ', toggle)

        //if user is not authed, toggle login modal
        document.getElementById('login').click();

        //return state to false
        this.helper.toggleLogin.next(false);
      }
    });

    //get all countries
    this.helper.getCountries().subscribe((res) => {
      this.countries = res.data;
    });
  }

  openChangeLanguageModal(languageModal){
    this.modal.open(languageModal, { centered: true })
  }

  openAuthModal(authModal) {
    this.modal.open(authModal, { centered: true });
  }

  changeLanguage(value){
    console.log(value)
    this.modal.dismissAll()
    if(value === 'en'){
      localStorage.setItem('lang', 'en');
    } else{
      localStorage.setItem('lang', 'sw');
    }
    this.helper.sendNewLanguage(localStorage.getItem('lang'))
    this.ngOnInit()
  }

  adminLoginForm = new FormGroup({
    dial_code: new FormControl('+255', Validators.required),
    phone_number: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  normalUserLoginForm = new FormGroup({
    dial_code: new FormControl('', Validators.required),
    phone_number: new FormControl('', Validators.required),
  });

  registrationForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
  });

  otpForm = new FormGroup({
    otp: new FormControl('', Validators.required),
  });

  authenticateNormalUser() {
    this.spinner.show();
    let data = {
      dial_code: this.normalUserLoginForm.get('dial_code').value,
      phone_number: this.normalUserLoginForm.get('phone_number').value,
    };

    this.authService.loginInNormally(data).subscribe(
      (res) => {
        console.log(res);

        if (res.data == 'Account Created') {
          this.phoneNumber = data.phone_number;
          this.dialCode = data.dial_code;
          this.signIn = false;
          this.createAccount = true;
          return this.spinner.hide();
        }

        this.signIn = false;
        this.isOTP = true;
        this.otpSignIn(data);
      },
      (err) => this.toastr.error('Failed to Login')
    );
  }

  createAccountAction() {
    let regData = {
      dial_code: this.dialCode,
      phone_number: this.phoneNumber,
      name: this.registrationForm.get('fullName').value,
    };

    this.spinner.show();
    this.authService.registerBuyer(regData).subscribe(
      (res) => {
        console.log('account created');

        this.createAccount = false;
        this.isOTP = true;
        this.registrationForm.reset();
        this.otpSignIn({
          dial_code: this.dialCode,
          phone_number: this.phoneNumber,
        });
      },
      (err) => {
        console.log('failed to create account');
        this.spinner.hide();
        this.toastr.error('Failed to create account');
      }
    );
  }

  otpSignIn(data) {
    this.authService.createOTP(data).subscribe(
      (response) => {
        this.normalUserLoginForm.reset();
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error('User does not exist');
      }
    );
  }

  generateTokenWithOTP() {
    this.spinner.show();
    this.authService.authenticateOTP(this.otpForm.get('otp').value).subscribe(
      (res) => {
        this.otpForm.reset();
        localStorage.setItem('access_token', res.data.token);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        this.spinner.hide();

        this.authService.userInformation().subscribe((response) => {

          localStorage.setItem('id', response.data.user.id)

          this.roles = response.data.roles;
          if (
            this.roles.some((el) => el.role == 'regular') &&
            this.roles.some((el) => el.role == 'seller')
          ) {
            //set role
            this.isOTP = false;
            this.chooseRole = true;
          } else {

            if (this.roles.find((x) => x.role == 'seller')) {
              localStorage.setItem('role', 'seller');
              this.role = localStorage.getItem('role');
              console.log('role set to ', this.role);

            } else {
              localStorage.setItem('role', 'buyer');
              this.role = localStorage.getItem('role');
              console.log('role set to ', this.role);
            }

            this.toastr.success(
              'Successfully Logged In As ' + localStorage.getItem('role')
            );
            this.isAuthed = true;
            firebase.default.auth().signInAnonymously().then(() => {
              this.router.navigate(['/']);
              window.location.reload();
              this.ngOnInit();
            }).catch(err => {
              console.error(err.message)
            })
          }
        });
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error('Incorrect OTP entered');
      }
    );
  }

  openIndicativePricesModal(indicativePricesModal){
    this.modal.open(indicativePricesModal, { size: 'lg', centered: true })
  }

  goToAdmin() {
    this.spinner.show();
    this.authService.login(this.adminLoginForm.value).subscribe(
      (res) => {
        localStorage.setItem('access_token', res.data.token);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        this.authService.userInformation().subscribe((response) => {
          this.roles = response.data.roles;
          if (
            this.roles.some((el) => el.role == 'admin') &&
            this.roles.some((el) => el.role == 'leader')
          ) {
            console.log('this person has two roles');
            //set role
            this.spinner.hide();
            this.chooseRoleAdmin = true;
          } else {
            this.roles.find((x) => x.role == 'admin')
              ? localStorage.setItem('role', 'admin')
              : localStorage.setItem('role', 'leader');

            this.modal.dismissAll();
            this.spinner.hide();
            this.router.navigate(['/admin']);
          }
        });
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(error.error.data);
      }
    );
  }

  chosenRole(role) {
    if (role) {
      localStorage.setItem('role', 'buyer');
      this.toastr.success(
        'Successfully Logged In As ' + localStorage.getItem('role')
      );
      this.role = 'buyer';
      this.isAuthed = true;
      window.location.reload();
      return this.ngOnInit();
    }
    localStorage.setItem('role', 'seller');
    this.role = 'seller';
    this.toastr.success(
      'Successfully Logged In As ' + localStorage.getItem('role')
    );
    this.isAuthed = true;
    firebase.default.auth().signInAnonymously().then(() => {
      window.location.reload();
      this.ngOnInit();
    }).catch(err => {
      console.error(err.message)
    })
  }

  chosenRoleAdmin(role) {
    if (role) {
      localStorage.setItem('role', 'leader');
      this.modal.dismissAll();
      return this.router.navigate(['/admin']);
    }
    localStorage.setItem('role', 'admin');
    this.modal.dismissAll();
    return this.router.navigate(['/admin']);
  }

  logout() {
    if(localStorage.getItem('role') === 'seller' || localStorage.getItem('role') === 'buyer'){
      firebase.default.auth().signOut().then(() => {
        localStorage.clear();
        this.isAuthed = false;
        this.toastr.success('Successfully Logged Out');
        this.router.navigate(['/']);
        return window.location.reload();
      })
    }
    localStorage.clear();
    this.isAuthed = false;
    this.toastr.success('Successfully Logged Out');
    this.router.navigate(['/']);
    return window.location.reload();
  }

  changeStatus() {
    this.isStaff = !this.isStaff;
  }
}
