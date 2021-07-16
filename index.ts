import { writeFileSync, readFileSync, PathLike } from "fs";

export default class Table<T> {
	filename: PathLike;
	file: Record<string, T>;
	constructor(filename: PathLike) {
		this.filename = filename;

		let readFile = (file: PathLike) => JSON.parse(readFileSync(file).toString());

		try {
			this.file = readFile(filename);
		} catch(err) {
			if(err.code != 'ENOENT')
				throw err
			writeFileSync(filename, "{}")
			this.file = readFile(filename);
		}
	}

	insert(toInsert: T) {
		let randLetters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ0123456789";
		let randLetter = () => randLetters[Math.floor(Math.random() * randLetters.length)];
		let outName = "";
		let i = 0;
		while(i < 16) {
			outName += randLetter();
			i++
		}
		if(outName in this.file) {
			this.insert(toInsert);
			return
		}
		this.file[outName] = toInsert
	}

	add(itemName: string, item: T) {
		if(this.file[itemName])
			throw new Error(`Attempted to add an object under the name of a pre-existing object from table: ${this.filename}`)
		this.file[itemName] = item
	}

	delete(fileID: string) {
		this.file[fileID] = undefined;
	}

	get(objID: string) {
		let file = this.file[objID];
		if(!file)
			throw new Error(`Attempted to access a nonexistent object from table: ${this.filename}`)
		return file
	}

	idOf(obj: T): string {
		for(let i in this.file) {
			if(this.file[i] === obj) {
				return i
			}
		}
		return "-"
	}

	replace(objID:string, replaceWith: T) {
		this.file[objID] = replaceWith
	}

	set(objID: string, propToModify: keyof T, replaceWith: T[keyof T]) {
		if(!this.file[objID])
			throw new Error(`Attempted to modify a nonexistent object from table: ${this.filename}`)
		this.file[objID][propToModify] = replaceWith
	}

	filter(filterFunc: (arg0: T, arg1: number, arg2: string) => boolean = el => el != undefined) {
		let returnObject = {};
		let keys = Object.keys(this.file).filter(
									(key, idx) => filterFunc(this.file[key], idx, key)
								);
		keys.map(key => returnObject[key] = this.file[key]);
		return returnObject
	}

	commit() {
		writeFileSync(this.filename, JSON.stringify(this.file));
	}
}