import { fetch } from "./base";

export interface Project {
  id: number;
  title: string;
  imgPaths: string[];
  hideImgNames: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllProjects = () =>
  fetch('/projects', {
    method: 'GET',
  });

export const getProject = (id: number) =>
  fetch(`/projects/${id}`, {
    method: 'GET',
  });

export const createProject = (title: string, hideImgNames: boolean) =>
  fetch('/projects', {
    method: 'POST',
    body: JSON.stringify({ title, hideImgNames }),
  });

export const updateProject = (id: number, title: string, hideImgNames?: boolean) =>
  fetch(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, hideImgNames }),
  });

export const deleteProject = (id: number) =>
  fetch(`/projects/${id}`, {
    method: 'DELETE',
  });

export const changeProjectsOrder = (projectIds: number[]) =>
  fetch('/projects/change-order', {
    method: 'POST',
    body: JSON.stringify({ projectsIds: projectIds }),
  });

export const changeProjectImagesOrder = (id: number, imageKeys: string[]) =>
  fetch(`/projects/${id}/images/change-order`, {
    method: 'POST',
    body: JSON.stringify({ imageKeys }),
  });

export const addImages = (id: number, keys: string[]) =>
  fetch(`/projects/${id}/images`, {
    method: 'POST',
    body: JSON.stringify({ keys }),
  });

export const removeImage = (id: number, key: string) =>
  fetch(`/projects/${id}/images`, {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  });

export const renameImage = (id: number, oldKey: string, newKey: string) =>
  fetch(`/projects/${id}/images`, {
    method: 'PUT',
    body: JSON.stringify({ oldKey, newKey }),
  });

export const getProjectImageUrls = (id: number) =>
  fetch(`/projects/${id}/images`, {
    method: 'GET',
  });
