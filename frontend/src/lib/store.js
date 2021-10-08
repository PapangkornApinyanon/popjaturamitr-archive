import { writable } from 'svelte/store';

const count = writable(localStorage.getItem("count") || parseInt(0));

export default count;