const { 
	fromEvent,
	from,
	merge,
} = window.rxjs;

const {
	map,
	switchMap,
	mergeMap,
	share,
	connect,
	pairwise,
} = window.rxjs.operators;

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getApiResponse = (searchString) => 
	new Promise(resolve => 
		setTimeout(() => {
			resolve(searchString);
		}, getRandomInt(1, 10) * 500));

const buttonElem = document.querySelector('#button');
const inputElem = document.querySelector('#input');
const requesContainerElem = document.querySelector('#cancel-prev-request-container');
const responseContainerElem = document.querySelector('#response-container');

const inputStream$ = fromEvent(inputElem, 'input');
const buttonClickStraem$ = fromEvent(buttonElem, 'click');
let maxLength = 0;

// Задание 1
buttonClickStraem$.subscribe(() => {
		removeValueFromElement({
			inputElem,
			requesContainerElem,
			responseContainerElem,
		});
		maxLength = 0;
});

inputStream$.pipe(
	map(e => e.target.value),
	connect((shared$) => merge(
		// Задание 2
		shared$.pipe(
			switchMap(value => from(getApiResponse(value))),
			map(value => pastValueIntoContainer(value, requesContainerElem))
		),
		// Задание 3
		shared$.pipe(
			mergeMap(value => from(getApiResponse(value))
				.pipe(
					map(item => {
						if (item === '') maxLength = 0;
						return { value: item, length: item.length }
					}),
				)
			),
			pairwise(),
			map(([prev, current]) => {
				if (current.length === 0) return { ...current};
				if (prev.length < current.length) {
					if (maxLength < current.length) {
						maxLength = current.length;
					}
					return { ...current };
				}
				
				if (maxLength < prev.length) {
					maxLength = prev.length;
				}
				return { ...prev };
			}),
			map((item) => {
				if (maxLength === item.length) {
					pastValueIntoContainer(item.value, responseContainerElem);
				}
			})
		),
	))
)
.subscribe();

const pastValueIntoContainer = (value, elem) => elem.innerHTML = value;
const removeValueFromElement = (elements) => {
	for (const key in elements) {
		elements[key].tagName === 'INPUT' ? 
			elements[key].value = '' :
			elements[key].innerHTML = '';
	}
}
