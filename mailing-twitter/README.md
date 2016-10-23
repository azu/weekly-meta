# mailing-twitter
## Installation

    npm install

## Usage

### Deploy

Use [Serverless Framework](https://github.com/serverless/serverless "Serverless Framework")

    sls deploy
    # or -s prod
    sls deploy -s prod

### API

API body should be following JSON.

```json
{
  "title": "Node.js Weekly",
  "url": "http://nodeweekly.com/issues/158"
}
```

## Tests

Use httpie.

    http post https://your-api.execute-api.us-east-1.amazonaws.com/dev/twitter/send <event.json


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT