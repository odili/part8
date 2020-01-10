import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Loading from './Loading';
import Error from './Error';

const Books = props => {
  const [filter, setFilter] = React.useState('');
  const { loading, error, data } = useQuery(BOOKS);
  if (!props.show) {
    return null;
  }

  if (error) return <Error error={error} />;
  if (loading) return <Loading />;

  const books = data.allBooks;

  let genres = books.reduce(
    (acc, cur) => {
      return [...acc, ...cur.genres];
    },
    ['refactoring']
  );

  genres = new Set(genres);
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(b => b.genres.includes(filter))
            .map(a => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div>
        <h4>filter books</h4>
        {Array.from(genres).map(genre => (
          <button
            key={genre}
            value={genre}
            onClick={e => setFilter(e.target.value)}
          >
            {genre}
          </button>
        ))}
        <button value="" onClick={() => setFilter('')}>
          all genre
        </button>
      </div>
    </div>
  );
};

export default Books;

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {
      name
      id
    }
    published
    genres
  }
`;

export const BOOKS = gql`
  {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
