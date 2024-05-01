import { Project } from 'ts-morph';

export class ContentsStore {
	private _project: Project = null!;

	collection: Array<{ path: string; content: string }> = [];
	withTransforms = new Set<string>();

	get project() {
		if (!this._project) {
			this._project = new Project({ useInMemoryFileSystem: true });
		}

		return this._project;
	}

	track(path: string, content: string) {
		this.collection.push({ path, content });
		this.project.createSourceFile(path, content, { overwrite: true });
	}
}
