import React from 'react';
import ReactDOM from 'react-dom';

import SearchResultApp from './components/app';

$(function () {

    var APPELEM = document.getElementById('search-result-app');

    if(APPELEM){
        ReactDOM.render(
            <SearchResultApp />,
			APPELEM
        );
    }
});