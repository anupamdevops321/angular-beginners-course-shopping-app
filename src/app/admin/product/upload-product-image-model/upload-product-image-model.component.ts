import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  AbstractControl,
  FormControl,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { modelStateFormMapper } from 'src/app/service/modelStateFormMapper';
import { ProductService } from 'src/app/service/product.service';
import { validateAllFormFields } from 'src/app/service/validateAllFormFields';

@Component({
  selector: 'app-upload-product-image-model',
  templateUrl: './upload-product-image-model.component.html'
})
export class UploadProductImageModelComponent implements OnInit {
  showSpinner = false;
  @Input()
  productId!: number;
  @ViewChild('myInput')
  myInputVariable!: ElementRef;

  @Output()
  public imageUploadCompleted = new EventEmitter<boolean>();

  public form!: FormGroup;
  public errors: string[] = [];
  private destroy: Subject<void> = new Subject<void>();

  constructor(
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  public control(name: string): AbstractControl | null {
    return this.form.get(name);
  }

  public ngOnInit() {
    this.form = this.buildForm();
  }

  private buildForm(): FormGroup {
    return new FormGroup({
      productImage: new FormControl('', [Validators.required]),
    });
  }

  public Submit(files: File[]): void {
    this.handleFileInput(files);
  }

  validateFileExtension(file: string | undefined) {
    if (file === 'jpg' || file === 'png' || file === 'jpeg') return true;
    else return false;
  }

  public handleFileInput(data: any): void {
    const files = data.files as File[];
    this.errors = [];
    
    validateAllFormFields(this.form);

    if (
      this.form.valid &&
      this.validateFileExtension(files[0].name.split('.').pop())
    ) {
      this.showSpinner = true;
      this.toastr.info('Image being uploaded', 'In Progress');
      const formData = new FormData();

      Array.from(files).forEach((f) => formData.append('image', f));
      formData.append('descriptions','REAL, ORGANIC MILK ON-THE-GO: Single-serve strawberry milk boxes are great for lunchboxes and on-the-go snacking.');
      formData.append('name','Horizon Organic Shelf-Stable 1% Low Fat Milk Boxes, Strawberry, 8 oz., 18 Pack');
      formData.append('price','12');
      formData.append('categoryId','10');
      formData.append('id','2');
      this.productService
        .UpdateProductImageModel(formData, 1)
        .subscribe({
          complete: () => {
            this.onComplete();
          }, // completeHandler
          error: (errorRes: HttpErrorResponse) => {
            this.onError(errorRes);
          }, // errorHandler
          next: () => {
            this.onSaveComplete();
          }, // nextHandler
        });
    } else {
      this.errors.push('Only file type .png, .jpg, .jpeg are allowed');
    }
  }

  onError(errorRes: HttpErrorResponse) {
    this.form.reset();
    this.myInputVariable.nativeElement.value = '';
    this.errors = modelStateFormMapper(this.form, errorRes, {});
    this.showSpinner = false;
    this.imageUploadCompleted.emit(false);
  }
  onComplete() {
    this.toastr.info('Completed', 'Process Completed');
    this.showSpinner = false;
    this.imageUploadCompleted.emit(true);
  }
  onSaveComplete() {
    this.toastr.success('Image uploaded', 'Save Success');
  }
}

