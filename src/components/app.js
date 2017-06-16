import React from 'react';
import { Component } from 'react';
import EmptySearch from './EmptySearch';
import HotelList from './HotelList';
import {number_format} from './utils';

var gMap = {
    needReRender: true,
    map: false,
    markers: {},
    collection: null,
    iconColor: "#0095b6",
    iconHoverColor: "#a5260a",
};

var itemsPerPage = 25;

var tour_finded_prev_glob = 0;
var tour_finded_glob = 0;

var arAjaxReq = [];



/*RENDER*/
var Render = {
    canvas: '',
    shape: '',
    prevX: 0,
    currX: 0,
    mainX: 0,
    X: 0,
    prevY: 0,
    currY: 0,
    mainY: 0,
    Y: 0,
    drawing: false,
    canDraw: true,
    active: false,
    color: "#666666",
    fill: "#a9bed0",
    line: 1,
    cordinates: [],
    projection: '',
    tools: document.getElementById('tools'),
    texts: {on: 'Выделить', off: 'Очистить', cancle: ' Отменить'},
    object: '',

    init: function(object){
        this.object = object;
        this.canvas = document.getElementById('render');
        this.tools = document.getElementById('tools');

        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("mousemove", function (e) {
            Render.findxy('move', 'mouse', e);
        }, false);
        this.canvas.addEventListener("mousedown", function (e) {
            Render.findxy('down', 'mouse', e);
        }, false);
        this.canvas.addEventListener("mouseup", function (e) {
            Render.findxy('up', 'mouse', e);
        }, false);
        this.canvas.addEventListener("mouseout", function (e) {
            Render.findxy('out', 'mouse', e);
        }, false);
        this.canvas.addEventListener("touchstart", function (e) {
            Render.findxy('down', 'touch', e);
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
            Render.findxy('move', 'touch', e);
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            Render.findxy('up', 'touch', e);
        }, false);

        this.tools.addEventListener("mouseup", Render.toolsSet, false);

    },

    draw: function(type){
        if(type == 'start'){
            this.ctx.beginPath();
            this.ctx.moveTo(this.prevX, this.prevY);
        }

        this.ctx.lineTo(this.currX, this.currY);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.line;
        this.ctx.stroke();

        if(type == 'finish'){
            this.drawing = false;
            $("#tools").children('span').text(Render.texts.off);
            $("#render").css({'z-index': 0});

            this.erase();
        }
    },

    erase: function(){

        this.canDraw = true;
        this.cordinates = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    touchScroll: function( event ) {
        event.preventDefault();
    },

    toolsSet: function(){
        if(gMap.polygon){
            gMap.polygon.events.remove('editorstatechange');
            gMap.map.geoObjects.remove(gMap.polygon);

            Render.object.setState({

                SEARCH: Render.object.state.SEARCH_RAW
            });
        }

        if(!Render.active){
            Render.active = true;
            $("#tools").children('span').text(Render.texts.cancle);
            $("#render").css({'z-index': 8});

            $('#render').bind( 'touchmove', Render.touchScroll );

            /*		$('html').css({
             'max-width': '100%',
             'max-height': '100%',
             'overflow': 'hidden'
             });*/
        }else{
            Render.active = false;
            Render.erase();
            $("#tools").children('span').text(Render.texts.on)
            $("#render").css({'z-index': 0});
            $(document).unbind( 'touchmove', Render.touchScroll );
        }
    },

    findxy: function(res, type, e){
        var dist = type == 'touch' ? e.targetTouches[0] : e;

        if (res == 'down') {
            if(!this.active) return;
            if(!this.canDraw){
                this.erase();
                this.findxy('down', e)
            };

            this.canDraw = false;
            this.currX = dist.clientX - $('#render').offset().left;
            this.currY = dist.clientY - $('#render').offset().top+$(document).scrollTop();
            this.X = dist.clientX;
            this.Y = dist.clientY+$(document).scrollTop();
            this.prevX = this.currX;
            this.prevY = this.currY;

            this.mainX = this.currX;
            this.mainY = this.currY;

            this.cordinates.push(this.projection.fromGlobalPixels( gMap.map.converter.pageToGlobal([this.X, this.Y]), gMap.map.getZoom()));

            this.drawing = true;
            this.draw('start');
        }else if (res == 'up' || res == "out") {
            if(!this.drawing) return;
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.currX = this.mainX;
            this.currY = this.mainY;

            this.cordinates.push(this.projection.fromGlobalPixels( gMap.map.converter.pageToGlobal([this.X, this.Y]), gMap.map.getZoom()));

            gMap.polygon = new ymaps.Polygon([
                this.cordinates
            ], {
                hintContent: "Обводка"
            }, {
                fillColor: Render.fill + '88',
                strokeColor: Render.color,
                strokeWidth: Render.line,
                strokeStyle: 'shortdash'
            });

            gMap.map.geoObjects.add(gMap.polygon);

            var that = this.object;

            that.setState({
                SEARCH: _.filter(that.state.SEARCH_RAW, function(item){
                    if (that.state.HOTELS_INFO && that.state.HOTELS_INFO[item.HOTEL_INFO_ID] && that.state.HOTELS_INFO[item.HOTEL_INFO_ID].PROPS) {
                        var point = that.state.HOTELS_INFO[item.HOTEL_INFO_ID].PROPS.LL_MAP_POINT.VALUE;
                        if (point) {
                            point = point.split(',');
                            try{
                                return gMap.polygon.geometry.contains([point[0], point[1]]);
                            }catch(e){
                                return true;
                            }
                        }
                    }
                })
            });

            $("#render").css({'z-index': 0});

            this.draw('finish');
        }else if (res == 'move') {
            if(!this.drawing) return;
            this.prevX = this.currX;
            this.prevY = this.currY;
            this.X = dist.clientX;
            this.Y = dist.clientY+$(document).scrollTop();
            this.currX = dist.clientX - $('#render').offset().left;
            this.currY = dist.clientY - $('#render').offset().top+$(document).scrollTop();

            this.cordinates.push(this.projection.fromGlobalPixels( gMap.map.converter.pageToGlobal([this.X, this.Y]), gMap.map.getZoom()));

            this.draw();
        }
    }
};

/*RENDER*/


export default class SearchResultApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1,
            SEARCH_RAW: {},
            SEARCH: {},
            isLoading: true,
            stars: this.getStars(),
            completedRequests: {},
            boundsFirst: true,
            isBtnOn: false,
            boards: [],
        };
    }

    componentDidUpdate() {
        this.initImgSlider();
        $tour.recalcSticky();
        tour_finded_prev_glob = incNum(tour_finded_prev_glob, tour_finded_glob, '.search-tours-finded');

        $('.js-tooltip').tooltip({
            position: {
                my: 'center bottom-10',
                at: 'center top'
            },
            show: false,
            hide: false
        });
    }

    handlePriceChange(from, to) {

        const obSearch = _.filter(this.state.SEARCH_RAW, function (item) {
            return item.Price >= from && item.Price <= to
        });

        if (Object.keys(obSearch).length != Object.keys(this.state.SEARCH).length) {
            this.setState({
                SEARCH: obSearch
            });
        }
    }

    handleNextPage(){
        this.setState({
            page: this.state.page + 1
        });
    }

    componentDidMount() {
        /*
        if(!this.state.isBtnOn){
            $('.filter__submit__search').html('ОСТАНОВИТЬ').addClass('stop');
        }*/

        $('body').on('click', '.js-add-to-fav', function () {
            addToFav(this, $(this).data('id'));
        });

        this.getNtkHotelList();
        this.handlerSliderRange();
        this.handleStars();
        this.initHotelHoverEvent();
        //this.handleStop();

        this.handleBoards();


    }

    handleBoards(){
        var that = this ;
        $('.input-drop-food').on('change', 'input', function () {
            var boards = [];

            $('.input-drop-food input:checked').each(function(){
                boards.push($(this).val());
            });

            that.setState({boards: boards});
        });
    }

    initHotelHoverEvent(){

        $('.main').on('mouseenter mouseleave', '.hotel-card', function(e){

            var hotelInfoId = $(e.currentTarget).data('hovel_info_id');
            var marker = gMap.markers[hotelInfoId];

            if(marker){
                if('mouseenter' == e.type){
                    marker.options.set({iconImageHref: 'mark_hov.png', zIndex: 9999999999});
                    gMap.map.setCenter(marker.geometry.getCoordinates());
                }else if('mouseleave' == e.type){
                    marker.options.set({iconImageHref: 'mark.png', zIndex: 999999999});
                }

            }

        });
    }

    handleStars() {

        $('.input-drop.input-drop-rating input').on('change', function (e) {
            this.setState({
                stars: this.getStars()
            });
        }.bind(this));
    }

    handleStop(){

        $('.filter__submit__search.stop').on( 'click', function(e){
            if(!this.state.isBtnOn){

                e.preventDefault();
                $(this).html('ИСКАТЬ')
                $('.filter__submit__search').removeClass('stop');


                this.setState({
                    isLoading: false,
                    isBtnOn: true,
                });

                _.forEach(arAjaxReq, function(val, key){
                    if(val) val.abort();
                });
            }
        }.bind(this));
    }

    getStars() {
        let stars = {};
        $('.input-drop.input-drop-rating input').each(function () {
            let $this = $(this);
            let value = +$this.val();
            if (isNaN(value)) value = 0;
            stars[value] = $this.parent().hasClass('-berry-checked');
        });
        return stars;
    }


    getNtkHotelList() {

        let origUrl = document.location.href;
        if(window.RuInturistStore.HOT_TOURS && window.RuInturistStore.HOT_TOURS.origUrl){
			origUrl =  window.RuInturistStore.HOT_TOURS.origUrl;
        }

        var _this = this;
        if (window.RuInturistStore.NTK_API_IN.Destination){
            var req = $.ajax({
                url: '/tour-search/ajax.php',
                data: {
                    NTK_API_IN: window.RuInturistStore.NTK_API_IN,
                    ajax: 'Y',
                    origUrl: origUrl
                },
                dataType: 'json',
                cache: false,

            }).done(function (data) {

                if (data && data.SEARCH instanceof Object) {

                    let obSearch = Object.assign({}, _this.state.SEARCH, data.SEARCH);

                    _this.setState({
                        SEARCH_RAW: obSearch,
                        SEARCH: obSearch,
                        HOTELS_INFO: Object.assign({}, _this.state.HOTELS_INFO, data.HOTELS_INFO),
                        USER_FAV: [].concat(data.USER_FAV, _this.state.USER_FAV),
                        isLoading: false
                    });

                }


            });

            arAjaxReq.push(req);
        }
    }


    handlerSliderRange() {
        const _that = this

        $(".slider-range").on("slidechange", function (event, ui) {

            $this = $(this);

            var priceFrom = $this.slider('values', 0);
            var priceTo = $this.slider('values', 1);

            _that.handlePriceChange(priceFrom, priceTo);
        });
    }

    initImgSlider() {
        $('.carousel-in').each(function () {
            var $root = $(this);
            var $thumbs = $root.next('.carousel-in-thumbs');

            $root.slick({
                accessibility: false,
                dots: false,
                arrows: true,
                fade: true
            });

            $thumbs.on('click', '.list__item', function () {
                $root.slick('slickGoTo', $(this).index());
            });

            $root.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                $thumbs.find('li').eq(nextSlide).addClass('-active').siblings('li').removeClass('-active');
            });
        });
    }

    initMapY() {
        if(!ymaps) return;
        if(gMap.map) return;

        if (!document.getElementById('map')) return;

        try{
            $("#map").css({'width':($("#mapMain").width()+'px')});
            $("#map").css({'height':($("#mapMain").height()+'px')});

            $("#render").css({'width':($("#mapMain").width()+'px')}).attr('width', $("#mapMain").width());
            $("#render").css({'height':($("#mapMain").height()+'px')}).attr('height', $("#mapMain").height());

            var ZoomLayout = ymaps.templateLayoutFactory.createClass(`
                <div class="no-txt-select">
                    <div id='zoom-out' class='btn'><i class='moreicon-minus'></i></div>
                    <div id='zoom-in' class='btn'><i class='moreicon-plus'></i></div>
                </div>`, {
 
                // Переопределяем методы макета, чтобы выполнять дополнительные действия
                // при построении и очистке макета.
                build: function () {
                    // Вызываем родительский метод build.
                    ZoomLayout.superclass.build.call(this);

                    // Привязываем функции-обработчики к контексту и сохраняем ссылки
                    // на них, чтобы потом отписаться от событий.
                    this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
                    this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

                    // Начинаем слушать клики на кнопках макета.
                    $('#zoom-in').bind('click', this.zoomInCallback);
                    $('#zoom-out').bind('click', this.zoomOutCallback);
                },

                clear: function () {
                    // Снимаем обработчики кликов.
                    $('#zoom-in').unbind('click', this.zoomInCallback);
                    $('#zoom-out').unbind('click', this.zoomOutCallback);

                    // Вызываем родительский метод clear.
                    ZoomLayout.superclass.clear.call(this);
                },

                zoomIn: function () {
                    var map = this.getData().control.getMap();
                    // Генерируем событие, в ответ на которое
                    // элемент управления изменит коэффициент масштабирования карты.
                    this.events.fire('zoomchange', {
                        oldZoom: map.getZoom(),
                        newZoom: map.getZoom() + 1
                    });
                },

                zoomOut: function () {
                    var map = this.getData().control.getMap();
                    this.events.fire('zoomchange', {
                        oldZoom: map.getZoom(),
                        newZoom: map.getZoom() - 1
                    });
                }
            });
            var zoomControl = new ymaps.control.ZoomControl({
                options: {
                    layout: ZoomLayout,
                    position: {
                        bottom: 10,
                        left: 10
                    }
                }
            });


            gMap.map = new ymaps.Map("map", {
                center: [55.031284, 44.459611],
                zoom: 7,
                controls: []
            }, {suppressMapOpenBlock: true});

            gMap.map.controls.add(zoomControl);

            var self = this;

            Render.projection = gMap.map.options.get('projection');

            Render.init(self);
        }catch(e) {
        }
    }



    renderMapPointsY(){
        /*
         * var placemark = new ymaps.Placemark([34, 56]);
         * */


        if(!gMap.map) return false;

        if(gMap.collection){
            gMap.collection.removeAll();
        }else{
            gMap.collection = new ymaps.GeoObjectCollection();
        }


        var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="balloon hoteldetail">' +
                    '<div class="balloon__header">' +
                        '<a href="#" class="balloon__close close">&times;</a>' +
                        '<b>$[properties.hotelName]</b>' +
                        '$[properties.hotelStarHtml]' +
                    '</div>' +
                    '<div class="balloon__content">' +
                        '$[[options.contentLayout ]]' +
                    '</div>' +
                    '<div class="arrow"></div>' +
                '</div>', {

                    /**
                     * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                     * @function
                     * @name build
                     */
                    build: function () {
                        this.constructor.superclass.build.call(this);

                        this._$element = $('.balloon', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.close')
                            .on('click', $.proxy(this.onCloseClick, this));
                    },

                    /**
                     * Удаляет содержимое макета из DOM.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                     * @function
                     * @name clear
                     */
                    clear: function () {
                        this._$element.find('.close')
                            .off('click');

                        this.constructor.superclass.clear.call(this);
                    },

                    /**
                     * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onSublayoutSizeChange
                     */
                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                        this.events.fire('shapechange');
                    },

                    /**
                     * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name applyElementOffset
                     */
                    applyElementOffset: function () {
                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight)
                        });
                    },

                    /**
                     * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                     * @function
                     * @name onCloseClick
                     */
                    onCloseClick: function (e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },

                    /**
                     * Используется для автопозиционирования (balloonAutoPan).
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                     * @function
                     * @name getClientBounds
                     * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                     */
                    getShape: function () {
                        if (!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight
                            ]
                        ]));
                    },

                    /**
                     * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
                     * @function
                     * @private
                     * @name _isElement
                     * @param {jQuery} [element] Элемент.
                     * @returns {Boolean} Флаг наличия.
                     */
                    _isElement: function (element) {
                        return element && element[0] && element.find('.arrow')[0];
                    }
                });

        var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<p>Цена: <b>{{properties.price}} Р</b></p>' +
            '<p>{{properties.descr}}</p>', {});

        gMap.markers = [];

        var SEARCH_SORTED = this.prepareSearchDate();

        _.map(SEARCH_SORTED, function (item) {

            if (this.state.HOTELS_INFO && this.state.HOTELS_INFO[item.HOTEL_INFO_ID] && this.state.HOTELS_INFO[item.HOTEL_INFO_ID].PROPS) {
                var point = this.state.HOTELS_INFO[item.HOTEL_INFO_ID].PROPS.LL_MAP_POINT.VALUE;

                if (point) {

                    point = point.split(',');
                    var price = number_format(item.Price, 0, ',', ' ');

                    var stars = this.state.HOTELS_INFO[item.HOTEL_INFO_ID].STARS;
                    var stars_int = this.state.HOTELS_INFO[item.HOTEL_INFO_ID].STARS_INT;
                    var stars_html = '';

                    if (stars_int > 0) {

                        stars_html = '<div class="rating -star-'+stars_int+'"></div>';
                    } else if(stars_int == 0){
                        stars_html = '';
                    } else {
                        stars_html = <div class="rating_litera"> {stars} </div>
                    }

                    gMap.markers[item.HOTEL_INFO_ID] = new ymaps.Placemark([point[0], point[1]], {
                        price: price,
                        descr: this.state.HOTELS_INFO[item.HOTEL_INFO_ID].LOCATION,
                        hotelName: this.state.HOTELS_INFO[item.HOTEL_INFO_ID].NAME,
                        hotelStarHtml: stars_html
                    }, {
                        balloonContentLayout: BalloonContentLayout,
                        balloonLayout: MyBalloonLayout,
                        balloonPanelMaxMapArea: 0,
                        iconLayout: 'default#image',
                        iconImageHref: 'mark.png',
                        iconImageSize: [22, 33],
                        iconImageOffset: [-12, -42]
                    });


                    gMap.collection.add(gMap.markers[item.HOTEL_INFO_ID])

                    gMap.markers[item.HOTEL_INFO_ID].events
                        .add('mouseenter', function (e) {
                            e.get('target').options.set('iconImageHref', 'mark_hov.png');
                        })
                        .add('mouseleave', function (e) {
                            e.get('target').options.set('iconImageHref', 'mark.png');
                        });

                }

            }
        }.bind(this));

        gMap.map.geoObjects.add(gMap.collection);

        let bounds = gMap.map.geoObjects.getBounds();

        if(bounds && !(!this.state.isLoading)){
            $('#tools').fadeIn(500);
            gMap.map.setBounds(bounds, {checkZoomRange: true});
        }



    }



    prepareSearchDate() {

        var SEARCH_SORTED = [];
        var allowedBoards = ['Все'];

        _.map(this.state.SEARCH, (item) => {
            SEARCH_SORTED.push(item);

            if(item.Board && 'ALL' != item.Board && -1 == allowedBoards.indexOf(item.Board)){
                allowedBoards.push(item.Board);
            }

        });

        var stateStars = _.filter(this.state.stars, function(item){
            return item;
        });

        stateStars = stateStars.length; // выбраны звезды или нет

        SEARCH_SORTED = _.filter(SEARCH_SORTED, function (item) {

            if(item.Board == 'ALL') item.Board = 'Все';

            if(this.state.boards.length && -1 == this.state.boards.indexOf(item.Board)){
                return false;
            }

            let hotelStar = +item.STARS || 0;

            if(stateStars){
                return (
                this.state.HOTELS_INFO[item.HOTEL_INFO_ID] && // отели которых нет бд
                item.Price >= $('.slider-range').slider('values', 0) && // срез по ценам
                item.Price <= $('.slider-range').slider('values', 1) &&
                this.state.stars[hotelStar] // срез по звездам
                )

            }else{
                return (
                this.state.HOTELS_INFO[item.HOTEL_INFO_ID] && // отели которых нет бд
                item.Price >= $('.slider-range').slider('values', 0) && // срез по ценам
                item.Price <= $('.slider-range').slider('values', 1)
                )

            }
        }.bind(this));

        SEARCH_SORTED.sort((a, b) => a.Price - b.Price);

        this.buildBoardList(allowedBoards)

        return SEARCH_SORTED;
    }

    buildBoardList(allowedBoards){
        var html = '';

        allowedBoards.forEach(function(item){
                var checked = '';
                if(this.state.boards.indexOf(item) != -1){
                    checked = 'checked';
                }

                if(item == 'Все'){
                    var name = 'dropallfood';
                }else{
                    var name = 'dropfood'+item;
                }

                html += `
                    <div class="checkbox">
                        <label for="checkdrop${item}">${item}</label>
                        <input type="checkbox"  ${checked} name="${name}" id="checkdrop${item}" class="berry" value="${item}">
                    </div>
                `;
        }.bind(this))

        $('.input-drop-food').html(html);
        $('.input-drop-food .berry').berry();
        setInputDropFoodValue();

    }

    render() {

        var listType = '';
        var searchHeader = '';
        var map = '';


        if (!window.RuInturistStore.NTK_API_IN.Destination) {
            $('#myProgress').remove();
            listType = <EmptySearch />;
        } else {

            var SEARCH_SORTED = this.prepareSearchDate();
            var tours_finded = Object.keys(SEARCH_SORTED).length;

            var header_val = '';
            var isShowLoader = '';
            var hideCnt = false;
            tour_finded_glob = tours_finded;

            if(!tours_finded) tours_finded = '';

            if (!this.state.isLoading) {
                $('#myProgress').remove();
                $('.filter__submit__search').html('ИСКАТЬ').removeClass('stop');

                $('.tour-filter__group__item--food').removeClass('disabled');

                if (!tours_finded) {

                    header_val = 'К сожалению, по Вашему запросу туров не найдено. Пожалуйста, измените условия поиска.';

                    searchHeader = <h1>К сожалению, по Вашему запросу туров не найдено. Пожалуйста, измените условия поиска.</h1>;
                    hideCnt = true;
                } else {

                    header_val = 'Найдено предложений: ';
                    searchHeader = <h1>Найдено предложений: <span className="search-tours-finded nopl">{tours_finded}</span> </h1>;
                    //this.initDrawBtn();
                    listType = (
                        <div>
                            <HotelList
                                user_fav={this.state.USER_FAV}
                                hotels={SEARCH_SORTED.slice(0, itemsPerPage*this.state.page)}
                                hotels_total={SEARCH_SORTED.length}
                                hotels_info={this.state.HOTELS_INFO}
                                handleNextPage={this.handleNextPage.bind(this)}
                            />
                        </div>
                    )
                }
            } else {
                header_val = 'Ищем для вас лучшие предложения ';
                isShowLoader = true;
                searchHeader = <h1>Ищем для вас лучшие предложения <span className="search-tours-finded">{tours_finded}</span></h1>;

                if(tours_finded){
                    listType = (
                        <div>
                            <HotelList
                            user_fav={this.state.USER_FAV}
                            hotels={SEARCH_SORTED.slice(0, itemsPerPage*this.state.page)}
                            hotels_total={SEARCH_SORTED.length}
                            hotels_info={this.state.HOTELS_INFO}
                            handleNextPage={this.handleNextPage.bind(this)}
                            />

                        </div>
                    )
                }
            }


        }


        return (

            <div className="row tour-search">
                {searchHeader}
                <div className="col__middle tour-search__results">
                    {listType}
                </div>
            </div>
        )
    }

    setSearchHeader(val, loader, cnt, hideCnt) {

        $('.col__middle.section .header-val').html(val);

        if (loader) $('.col__middle.section .search-loader').removeClass('hidden');
        else $('.col__middle.section .search-loader').addClass('hidden');

        if (hideCnt) {
            $('.col__middle.section .search-tours-finded').remove();
        } else {
            var from = +$('.col__middle.section .search-tours-finded').html();

            incNum(from, cnt, '.col__middle.section .search-tours-finded');
        }
    }

}
