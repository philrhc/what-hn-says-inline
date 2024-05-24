(function() {
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    // let hasHighlighted = false;    
    
    async function insertComments(inlineComments) {
      // if (hasHighlighted) {
      //   return;
      // }
      // hasHighlighted = true;

      console.log(inlineComments);
      for (var i = 0; i < inlineComments.length; i++) {
        let comment = inlineComments[i].comment_text;
        let link = linkToComment(inlineComments[i].objectID)
        let quote = findQuote(comment);
        highlight(quote, link);
      }
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (message.command === "insertComments") {
        insertComments(message.data);
      }
    });
  })();

function linkToComment(commentId) {
  return "https://news.ycombinator.com/item?id=" + commentId
}

function findQuote(comment) {
  let split = comment.split("<p>")[0];
  let indentRemoved = split.replace("&gt;", "");
  let quotesRemoved = indentRemoved.replace("&quot;", "");
  let decoded = decodeHtml(quotesRemoved)
  let quotedAgainRemoved = decoded.replace('"', "");
  let trimmed = quotedAgainRemoved.trim();
  return trimmed;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function highlight(quote, link) {
  console.log(quote);

  var xpath = `//p[contains(text(),'${quote}')]`;
  var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  let insert = `
    <div class="phil-highlight">
       ${quote}
       <div class="phil-extension">
          <div class="phil-comment">
            <p>Seriously, in which reality-distortion bubble does Prabhakar Raghavan live?</p>
          </div>
       </div>
     </div>
  `

  matchingElement.innerHTML = matchingElement.innerHTML.replace(new RegExp(quote, "gi"), insert);
}
  