
export async function withErrorHandling<T>(action: (() => Promise<T>), next: ((err: Error) => void)) {
    try{
        return await action();
    }
    catch (err) {
        next(err);
    }
}