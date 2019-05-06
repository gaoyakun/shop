export class DoubleListIterator<T = any> {
    private _node: DoubleListNodeImpl;
    private _reverse: boolean;
    private _dl: DoubleList<T>;
    constructor (dl:DoubleList<T>, node:DoubleListNodeImpl, reverse:boolean) {
        this._dl = dl;
        this._node = node;
        this._reverse = reverse;
    }
    valid (): boolean {
        return this._node !== this._dl.head;
    }
    next (): DoubleListIterator<T> {
        if (this.valid()) {
            this._node = (this._reverse ? this._node.prev : this._node = this._node.next);
        }
        return this;
    }
    prev (): DoubleListIterator<T> {
        if (this.valid()) {
            this._node = (this._reverse ? this._node.next : this._node = this._node.prev);
        }
        return this;
    }
    get node () {
        return this._node;
    }
    set node (n: DoubleListNodeImpl) {
        this._node = n;
    }
    get reversed () {
        return this._reverse;
    }
    get list () {
        return this._dl;
    }
    get data () {
        if (this.valid()) {
            return (this._node as DoubleListNode<T>).data;
        } else {
            throw new Error ('Invalid interator');
        }
    }
    set data (val: T) {
        if (this.valid()) {
            (this._node as DoubleListNode<T>).data = val;
        }
    }
}

export class DoubleList<T = any> {
    private _head: DoubleListNodeImpl;
    private _length: number;
    constructor () {
        this._head = new DoubleListNodeImpl();
        this._length = 0;
    }
    get head () {
        return this._head;
    }
    get length () {
        return this._length;
    }
    clear () {
        while (this._length > 0) {
            this.remove (this.begin ());
        }
    }
    append (data: T) {
        this._insertAt (this._head, data);
        return this;
    }
    prepend (data: T) {
        this._insertAt (this._head.next, data);
        return this;
    }
    remove (it: DoubleListIterator<T>) {
        if (it.valid () && it.list === this) {
            const node = it.node;
            it.next ();
            this._remove (node);
        }
    }
    insertAt (it: DoubleListIterator<T>, data: T) {
        if (it.list === this) {
            if (it.valid ()) {
                if (it.reversed) {
                    this._insertAt (it.node.next, data);
                } else {
                    this._insertAt (it.node, data);
                }
            } else {
                this.append (data);
            }
        }
    }
    forEach (callback: (data:T) => void) {
        for (let it = this.begin(); it.valid(); it.next()) {
            callback && callback (it.data);
        }
    }
    forEachReverse (callback: (data:T) => void) {
        for (let it = this.rbegin(); it.valid(); it.next()) {
            callback && callback (it.data);
        }
    }
    front (): T {
        return this.begin().data;
    }
    back (): T {
        return this.rbegin().data;
    }
    begin (): DoubleListIterator<T> {
        return new DoubleListIterator(this, this._length > 0 ? this._head.next : this._head, false);
    }
    rbegin (): DoubleListIterator<T> {
        return new DoubleListIterator(this, this._length > 0 ? this._head.prev : this._head, true);
    }
    private _remove (node: DoubleListNodeImpl) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        delete node.prev;
        delete node.next;
        this._length--;
    }
    private _insertAt (node: DoubleListNodeImpl, data: T) {
        const newNode = new DoubleListNode(data);
        newNode.next = node;
        newNode.prev = node.prev;
        node.prev.next = newNode;
        node.prev = newNode;
        this._length++;
        return newNode;
    }
}

class DoubleListNodeImpl {
    next: DoubleListNodeImpl;
    prev: DoubleListNodeImpl;
    constructor () {
        this.next = this;
        this.prev = this;
    }
}

class DoubleListNode<T = any> extends DoubleListNodeImpl {
    data: T;
    constructor (data: T) {
        super ();
        this.data = data;
    }
}
