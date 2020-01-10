import React from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommend from './components/Recommend';

const App = () => {
  const [page, setPage] = React.useState('authors');
  // const [token, setToken] = React.useState(null);

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommended</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <Login show={page === 'login'} setPage={() => setPage('add')} />

      <Recommend show={page === 'recommend'} />
      <NewBook show={page === 'add'} />
    </div>
  );
};

export default App;
