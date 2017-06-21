import React from 'react';
import { Component } from 'react';
import {number_format} from './utils';
export default class HotelItem extends Component {

    hotelImages(images){

        if(images.length){
            var imgCnt = 1;
            return <div className="col__left hotel-card__image">
                <div className="carousel carousel-in">
                {_.map(images, (item) => {
                    return (<div key={++imgCnt+item} className="carousel__item">
                        <img src={item} alt=""/>
                    </div>)
                })}
                </div>
            </div>
        }else{
            return <div className="col__left hotel-card__image no-photo">
                <img src="/local/tpl_ext/images/no-photo.png" />
            </div>
        }
    }

    render() {

        if (!this.props.hotel_info) {
            return (
                <span></span>
            )
        } else {


            let discount = 0;
            if(window.RuInturistStore.HOT_TOURS && window.RuInturistStore.HOT_TOURS.discount){
				discount = parseInt(window.RuInturistStore.HOT_TOURS.discount);
            }



            var fav_ico = '';

            var minServices = '';
            if(window.RuInturistStore.FILTER_IN.pack_type == "fullBoard"){
                minServices = 'перелет, проживание';
            }else{
                minServices = 'проживание';
            }

            if(this.props.is_fav){
                fav_ico = <img src="/local/tpl_ext/images/heart.png" alt="Удалить из закладок" />
            }else{
                fav_ico = <img src="/local/tpl/dist/static/i/book.png" alt="Добавить в закладки" />
            }

            var id = this.props.hotel_info.ID || [];
            var images = this.props.hotel_info.IMAGES || [];
            var name = this.props.hotel_info.NAME || '';
            var name_raw = this.props.hotel_info.NAME_RAW || '';
            var price = parseInt(this.props.item.Price);
            var pricePrint = number_format(this.props.item.Price, 0, ',', ' ');
			let beforeDiscountPrice = price + (price * discount / 100);
			let beforeDiscountPricePrint = number_format(beforeDiscountPrice, 0, ',', ' ');

            var TourDate = this.props.item.TourDate;
            var HotelLoad = this.props.item.HotelLoad || '';
            if (this.props.hotel_info.ATTRS) {

                var swimming_pool = this.props.hotel_info.ATTRS.IS_SWIMMING_POOL ? <li className="list__item">
                    <i className="icon-hotel-datailed-option-1"></i>
                </li> : '';
                var wifi = this.props.hotel_info.ATTRS.IS_WIFI ? <li className="list__item">
                    <i className="icon-hotel-datailed-option-4"></i>
                </li> : '';
                var sport_gym = this.props.hotel_info.ATTRS.IS_SPORT_GYM ? <li className="list__item">
                    <i className="icon-hotel-datailed-option-5"></i>
                </li> : '';

                var sea = this.props.hotel_info.ATTRS.IS_SEA ? <li className="list__item">
                    <i className="icon-hotel-datailed-option-9"></i>
                </li> : '';

                var air_cond = this.props.hotel_info.ATTRS.IS_AIR_COND ? <li className="list__item">
                    <i className="icon-hotel-datailed-option-10"></i>
                </li> : '';
            }
            var stars = this.props.hotel_info.STARS;
            var stars_int = this.props.hotel_info.STARS_INT;
            var stars_html = '';

            var detailLink = this.props.hotel_info.DETAIL_LINK;
			detailLink = '/tour-search/?' + detailLink.split('?')[1];

            if (stars_int > 0) {
                var classStars = "rating -star-" + stars_int;
                stars_html = <div className={classStars}></div>
            } else if(stars_int == 0){
                stars_html = '';
            } else {
                stars_html = <div className="rating_litera"> {stars} </div>
            }

            if(this.props.hotel_info.PROPS){
                var coords = this.props.hotel_info.PROPS.LL_MAP_POINT.VALUE;
            }

            var location = '';
            if(this.props.hotel_info.LOCATION){
                location = <div className="hotel-city__resort">{this.props.hotel_info.LOCATION}</div>
            }

            var hotel_view = '';
            if(this.props.hotel_info.HOTEL_VIEW){
                hotel_view = <li className="list__item">
                                <span className="list__label">Просмотрело за сутки</span>
                                <b>{this.props.hotel_info.HOTEL_VIEW}</b>
                            </li>;
            }

            return (
                <li className="list__item">

                    <div className="row hotel-card"  data-hovel_info_id={this.props.item.HOTEL_INFO_ID}>
                        {this.hotelImages(images)}
                        <div className="col__middle hotel-card__content">
                            {stars_html}
                            <h5 className="hotel-card__title">
                                {name_raw}
                                {location}
                            </h5>
                            <ul className="list -float hotel-card__options">
                                {swimming_pool}
                                {wifi}
                                {sport_gym}
                                {sea}
                                {air_cond}
                            </ul>
                            <div className="hotel-card__date">{TourDate}</div>
                            <div className="hotel-card__service">{minServices}</div>
                            <ul className="list hotel-card__links">
                                <li className="list__item">
                                    <a href="javascript://" className="js-add-to-fav js-tooltip" data-id={id} title="Добавить в историю поиска">
                                        {fav_ico}
                                    </a>
                                </li>
                                <li className="list__item">
                                    <a href="" className="js-send-to-email js-tooltip" data-id={id} data-url={detailLink} title="Отправить себе на электронную почту">
                                        <img src="/local/tpl/dist/static/i/mail.png" alt=""/>
                                    </a>
                                </li>
                            </ul>
                            <a href={detailLink} className="button">
                                <span className="button__row">
                                    <span className="button__cell">
                                        {beforeDiscountPrice ?
                                            <span className="button__cell">
                                                <span className="button__price -discount">от <b>{pricePrint}</b> тг</span>
                                                <span className="button__price__old -old"> {beforeDiscountPricePrint} тг</span>
                                            </span>
                                            :
                                            <span className="button__price"> от <b>{pricePrint}</b> тг.</span>
                                        }
                                    </span>
                                </span>
                            </a>
                        </div>
                    </div>
                </li>
            );

        }
    }

}