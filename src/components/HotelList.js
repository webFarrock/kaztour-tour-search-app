import React from 'react';
import { Component } from 'react';
import HotelItem from './HotelItem';
export default class HotelList extends Component {
    render() {
        var cnt = 1;
        return (
            <div>
            <ul className="list -inline tour-search__results__list">
                {_.map(this.props.hotels, (item) => {
                    let is_fav = false;
                    if(
                        //this.props.user_fav instanceof Object &&
                        this.props.hotels_info[item['HOTEL_INFO_ID']] &&
                        this.props.hotels_info[item['HOTEL_INFO_ID']]['ID'] &&
                       //   this.props.user_fav[this.props.hotels_info[item['HOTEL_INFO_ID']]['ID']]
                       -1 != this.props.user_fav.indexOf(this.props.hotels_info[item['HOTEL_INFO_ID']]['ID'])
                    ){
                        is_fav = true;
                    }
                    var key = '';

                    if(this.props.hotels_info && this.props.hotels_info[item['HOTEL_INFO_ID']]){
                        var key = this.props.hotels_info[item['HOTEL_INFO_ID']].ID;
                    }else{
                        var key = item['HOTEL_INFO_ID']+'-'+cnt++;
                    }

                    return (<HotelItem
                        key={key}
                        item={item}
                        hotel_info={this.props.hotels_info[item['HOTEL_INFO_ID']]}
                        is_fav={is_fav}
                        />)
                })}
            </ul>
            {this.renderPagination()}
            </div>
        );
    }

    renderPagination(){

        if(this.props.hotels_total > this.props.hotels.length){
            return (
                <div className="loader" onMouseDown={e => this.handlerShowMore(e)}>
                    <a href="#"  className="loader__link">посмотреть еще</a>
                </div>
            )
        }
    }

    handlerShowMore(e){
        this.props.handleNextPage();
		e.stopPropagation();
		e.preventDefault();
		return false;
    }

}