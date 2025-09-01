import { apiService } from './api';

export interface ProjectDocument {
  id: string;
  projectId: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  s3Key: string;
  uploadedAt: string;
  isVisibleToBuilders: boolean;
}

export interface UploadResponse {
  uploadUrl: string;
  documentId: string;
  s3Key: string;
}

class DocumentService {
  async getUploadUrl(projectId: string, fileName: string, fileSize: number, mimeType: string, documentType: string): Promise<UploadResponse> {
    return apiService.post<UploadResponse>('/documents/upload-url', {
      projectId,
      fileName,
      fileSize,
      mimeType,
      documentType
    });
  }

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
  }

  async confirmUpload(documentId: string): Promise<ProjectDocument> {
    return apiService.post<ProjectDocument>(`/documents/${documentId}/confirm`);
  }

  async getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
    return apiService.get<ProjectDocument[]>(`/projects/${projectId}/documents`);
  }

  async deleteDocument(documentId: string): Promise<void> {
    return apiService.delete(`/documents/${documentId}`);
  }

  async getDownloadUrl(documentId: string): Promise<{ downloadUrl: string }> {
    return apiService.get<{ downloadUrl: string }>(`/documents/${documentId}/download`);
  }

  async updateBuilderVisibility(documentId: string, isVisible: boolean): Promise<ProjectDocument> {
    return apiService.patch<ProjectDocument>(`/documents/${documentId}/builder-visibility`, {
      isVisibleToBuilders: isVisible
    });
  }

  async uploadDocument(projectId: string, file: File, documentType: string): Promise<ProjectDocument> {
    // Step 1: Get upload URL
    const { uploadUrl, documentId } = await this.getUploadUrl(
      projectId,
      file.name,
      file.size,
      file.type,
      documentType
    );

    // Step 2: Upload file to S3
    await this.uploadFile(uploadUrl, file);

    // Step 3: Confirm upload and get document record
    return this.confirmUpload(documentId);
  }
}

export const documentService = new DocumentService();
