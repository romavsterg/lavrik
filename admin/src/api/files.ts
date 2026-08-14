import { fetch } from "./base";

export const getUploadUrl = (key: string, contentType: string) =>
  fetch('/files/upload-url', {
    method: 'POST',
    body: JSON.stringify({ key, contentType }),
  });

export const getDownloadUrl = (key: string) =>
  fetch('/files/download-url', {
    method: 'POST',
    body: JSON.stringify({ key }),
  });

export const deleteFile = (key: string) => {
  return fetch('/files', {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  });
};
