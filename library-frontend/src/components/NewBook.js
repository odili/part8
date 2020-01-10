import React from 'react';
import {
  useMutation,
  useSubscription,
  useApolloClient,
} from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
// import Error from './Error';
import { BOOKS, BOOK_DETAILS } from './Books';

const NewBook = props => {
  const [title, setTitle] = React.useState('');
  const [author, setAuhtor] = React.useState('');
  const [published, setPublished] = React.useState('');
  const [genre, setGenre] = React.useState('');
  const [genres, setGenres] = React.useState([]);
  const client = useApolloClient();

  const [addNewBook] = useMutation(ADD_BOOK, {
    onError: err => console.log(err),
    // refetchQueries: [{ query: AUTHORS }, { query: BOOKS }],
    update: (store, response) => {
      const currentDataInStore = store.readQuery({ query: BOOKS });
      currentDataInStore.allBooks.push(response.data.addNewBook);
      store.writeQuery({
        query: BOOKS,
        data: currentDataInStore,
      });
    },
  });

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData, client }) => {
      const addedBook = subscriptionData.data.bookAdded;
      // console.log(subscriptionData.data);
      alert(addedBook.title);
      updateCacheWith(addedBook, client);
    },
  });

  const updateCacheWith = addedBook => {
    const includedIn = (set, object) => set.map(p => p.id).includes(object.id);

    const dataInStore = client.readQuery({ query: BOOKS });
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      dataInStore.allBooks.push(addedBook);
      client.writeQuery({
        query: BOOKS,
        data: dataInStore,
      });
    }
  };

  if (!props.show) {
    return null;
  }

  const submit = async e => {
    e.preventDefault();
    await addNewBook({
      variables: { title, author, published: Number(published), genres },
    });
    // console.log(title, author, Number(published), genres);

    // setTitle('');
    // setPublished('');
    // setAuhtor('');
    // setGenres([]);
    // setGenre('');
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;

const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      id
      title
      author {
        id
        name
      }
      published
      genres
    }
  }
`;

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
