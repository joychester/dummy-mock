package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/buaazp/fasthttprouter"
	"github.com/valyala/fasthttp"
)

var mockGet []byte
var mockPost []byte

func MockGet(ctx *fasthttp.RequestCtx) {

	var duration int = 0

	fmt.Printf("query params: %v\n", ctx.QueryArgs())
	
	if ctx.QueryArgs().Has("duration") {
		duration, _ = strconv.Atoi(string(ctx.QueryArgs().Peek("duration")))
		fmt.Printf("response time: %d\n", duration )
	} else {
		duration = 100
		fmt.Printf("using default response time: %d\n", duration )
	}

	time.Sleep(time.Duration(duration) * time.Millisecond)

	ctx.Response.Header.Set("Content-Type", "application/json")
	ctx.Response.Header.Set("X-Server-Time", strconv.Itoa(duration))

	ctx.Write(mockGet)
}

func MockPost(ctx *fasthttp.RequestCtx) {
	
	var duration int = 0

	if ctx.QueryArgs().Has("duration") {
		duration, _ = strconv.Atoi(string(ctx.QueryArgs().Peek("duration")))
		fmt.Printf("response time: %d\n", duration )
	} else {
		duration = 100
		fmt.Printf("using default response time: %d\n", duration )
	}

	time.Sleep(time.Duration(duration) * time.Millisecond)

	ctx.Response.Header.Set("Content-Type", "application/json")
	ctx.Response.Header.Set("X-Server-Time", strconv.Itoa(duration))

	ctx.Write(mockPost)
}

func main() {

	mGet, e1 := ioutil.ReadFile("/app/mocks/response-GET.json")
	mPost, e2 := ioutil.ReadFile("/app/mocks/response-POST.json")
	if e1 != nil {
		fmt.Printf("Error reading mock file: %v\n", e1)
		os.Exit(1)
	} else if e2 != nil {
		fmt.Printf("Error reading mock file: %v\n", e2)
		os.Exit(1)
	}

	mockGet = mGet
	mockPost = mPost

	fmt.Println("starting...")

	router := fasthttprouter.New()
	router.GET("/", MockGet)
	router.POST("/", MockPost)

	log.Fatal(fasthttp.ListenAndServe(":80", router.Handler))

}
