import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';

// Hacker News API Endpoint with Server-Side Searching
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// The structure typing of what resposne we get back from the API
type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: string;
  points: string;
};
type Stories = Array<Story>;

// Custom React Hook: https://reactjs.org/docs/hooks-custom.html
const useSemiPersistentState = (key: string, initialState: string): [string, (newValue: string) => void] => {
  const isMounted = React.useRef(false); // Don't render on first (Not needed by an example)

  const [value, setValue] = React.useState(
    localStorage.getItem(key) ?? initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

// useReducer to manage complex state: https://reactjs.org/docs/hooks-reference.html#usereducer
type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
};

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
};

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story: any) => action.payload.objectID !== story.objectID
        )
      };
    default:
      throw new Error();
  }
};

const extractSearchTerm = (url: string) => url.replace(API_ENDPOINT, '');
const getLastSearches = (urls: string[]) => 
  urls
    .reduce((result: Array<string>, url: string, index: number) => {
      const searchTerm = extractSearchTerm(url);

      if (index === 0) return result.concat(searchTerm);

      const previousSearchTerm = result[result.length - 1];
      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1)
    .map((url: string) => extractSearchTerm(url));
const getUrl = (searchTerm: string) => `${API_ENDPOINT}${searchTerm}`;

export default function App(): JSX.Element {
  // Components State
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [urls, setUrls] = React.useState([getUrl(searchTerm)]);
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });

  // Handler functions to react to changes in the application
  // Note: React.SyntheticEvent is often enough https://reactjs.org/docs/events.html
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); }
  const handleSearch = (searchTerm: string) => {
    const url = getUrl(searchTerm);
    setUrls(urls.concat(url))
  }
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm)
    event.preventDefault();
  };
  const handleFetchStories = React.useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);
  const handleRemoveStory = (item: Story) => {
    dispatchStories({ type: 'REMOVE_STORY', payload: item });
  };
  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm);
  };

  // Defining any side-effects that should happen as state changes
  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const lastSearches = getLastSearches(urls);

  return (
    <div>
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
            My Hacker Stories
          </h2>
        </div>
      </div>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {lastSearches.map((searchTerm: string, index: number) => (
        <button
          key={searchTerm + `${index}`}
          className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1"
          style={{transition: "all .15s ease"}}
          type="button"
          onClick={() => handleLastSearch(searchTerm)}
        >
          {searchTerm}
        </button>
      ))}

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};