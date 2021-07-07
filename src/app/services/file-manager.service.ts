import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  constructor(private config: ConfigService, private http: HttpClient) {}

  public uploadFile(tag, id, file) {
    return this.http.post(
      `${this.config.apiUrl}/service/file-manager/upload/tag/${tag}/reference-id/${id}`,
      file
    );
  }

  public uploadTemporaryFile(tag, id, file) {
    return this.http.post(
      `${this.config.apiUrl}/service/file-manager/upload/tag/${tag}/temporary-id/${id}`,
      file
    );
  }

  public readFileByReferenceID(id) {
    return this.http.get(
      `${this.config.apiUrl}/service/file-manager/read/${id}`
    );
  }

  public updateTemporaryFile(tempId, id) {
    //check this
    return this.http.put(
      `${this.config.apiUrl}/service/file-manager/update-temporary-file/temp-id/${tempId}/reference/${id}`,
      {}
    );
  }

  public deleteFileByReferenceId(id) {
    return this.http.delete(
      `${this.config.apiUrl}/service/file-manager/delete/${id}`
    );
  }
}
