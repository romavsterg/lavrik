import { fetch } from "./base";

export interface Project {
  id: number;
  title: string;
  imgPaths: string[];
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

export const createProject = (title: string) =>
  fetch('/projects', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });

export const updateProject = (id: number, title: string) =>
  fetch(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title }),
  });

export const deleteProject = (id: number) =>
  fetch(`/projects/${id}`, {
    method: 'DELETE',
  });

export const addImage = (id: number, key: string) =>
  fetch(`/projects/${id}/images`, {
    method: 'POST',
    body: JSON.stringify({ key }),
  });

export const removeImage = (id: number, key: string) =>
  fetch(`/projects/${id}/images`, {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  });

export const getProjectImageUrls = (id: number) =>
  fetch(`/projects/${id}/images`, {
    method: 'GET',
  });
