type Target = Function
class FunctionEntry {
    thisArg: any
    args?: any
}
class Entry {
    prop: string
    funcEntry?: FunctionEntry
}

class Data {
    root: any
    path: Entry[]
}

const privates = new WeakMap<Target, Data>()
function create(d: Data) {
    const t = () => {}
    privates.set(t, d)
    return new Proxy(t, new esimorp_handler)
}

async function run(d: Data, resolve, reject) {
    const runSingle = async (root: any, e: Entry) => {
        const rootObject = await root
        const value = rootObject[e.prop]
        if (!e.funcEntry) {
            return await value
        }

        return value.apply(rootObject, e.funcEntry.args)
    }


    const runInternal = (root: any, path: Entry[]) => {
        if (!path.length) {
            return resolve(root)
        }

        runInternal(runSingle(root, path[0]), path.slice(1))        
    }

    runInternal(d.root, d.path)
}

class esimorp_handler implements ProxyHandler<Target> {
    get (target : Target, prop: string) {
        const d = privates.get(target)
        return create({root: d.root, path: [...d.path, {prop}]})
    }

    apply(target: Target, thisArg: any, args?: any) {
        const d = privates.get(target)
        const isFunction = f => typeof f === 'function'
        const entry = d.path[d.path.length - 1]
        if (entry.prop !== 'then' || !isFunction(args[0])) {
            entry.funcEntry = {thisArg, args}
            return create(d)
        }

        const resolve = args[0]
        const globalReject = e => {
            throw e;
        }
        const reject = args[1] || globalReject
        run({root: d.root, path: d.path.slice(0, -1)}, resolve, reject)
    }
}

export function esimorp(something: any) {
    return create({root: something, path: []})
}