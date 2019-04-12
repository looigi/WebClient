import {AbstractControl} from '@angular/forms';

export class CustomValidators {
  public static passwordConfirm(form: AbstractControl): {invalid: boolean} {
    if (form.get('newPassword1').value !== form.get('newPassword2').value ) {
      return {invalid: true};
    }
  }

  public static passwordMatch(form: AbstractControl): {invalid: boolean} {
    if (form.get('oldPassword').value === form.get('newPassword1').value ) {
        return {invalid: true};
      }
  }

}
